import type { SystemConfig, AuditLogEntry } from '../models/SystemConfig';
import { DEFAULT_SYSTEM_CONFIG } from '../models/SystemConfig';
import {
  normalizeReferralProgramRules,
  syncLegacyBonusFields,
} from '../utils/referralProgram';

const STORAGE_CONFIG = 'parrainage.system.config.v1';
const STORAGE_AUDIT = 'parrainage.audit.log.v1';

const toDate = (v: unknown): Date => {
  if (v instanceof Date) return v;
  const s = typeof v === 'string' ? v : '';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

const safeJsonParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const normalizeWorkflow = (cfg: SystemConfig): SystemConfig['adminWorkflow'] => {
  const fallback = DEFAULT_SYSTEM_CONFIG.adminWorkflow!;
  const raw = cfg.adminWorkflow ?? fallback;
  const allowedRoles = new Set(['Coach', 'Manager', 'RP', 'RH']);
  const allowedActions = new Set(['Validate', 'Reject', 'Approve', 'Archive']);
  const cleaned = raw.steps
    .filter((s) => allowedRoles.has(s.role))
    .map((s, i) => ({
      ...s,
      id: s.id || `wf-step-${i + 1}`,
      slaHours: Number.isFinite(s.slaHours) && s.slaHours >= 0 ? s.slaHours : 24,
      actions: s.actions.filter((a) => allowedActions.has(a)),
    }));
  const byRole = new Map(cleaned.map((s) => [s.role, s]));
  const ensure = (role: 'Coach' | 'Manager' | 'RP' | 'RH') =>
    byRole.get(role) ?? fallback.steps.find((s) => s.role === role)!;
  return {
    steps: [ensure('Coach'), ensure('Manager'), ensure('RP'), { ...ensure('RH'), role: 'RH' }],
    auditAccess: {
      enabled: !!raw.auditAccess.enabled,
      readOnly: true,
      logs: !!raw.auditAccess.logs,
      history: !!raw.auditAccess.history,
      export: !!raw.auditAccess.export,
    },
  };
};

const normalizeFullConfig = (cfg: SystemConfig): SystemConfig => {
  const rules = normalizeReferralProgramRules(cfg);
  const legacy = syncLegacyBonusFields(rules);
  const wf = normalizeWorkflow({ ...cfg, referralProgramRules: rules, ...legacy });
  return {
    ...cfg,
    referralProgramRules: rules,
    ...legacy,
    adminWorkflow: wf,
  };
};

export const AdminService = {
  getSystemConfig(): SystemConfig {
    const raw = safeJsonParse<SystemConfig>(localStorage.getItem(STORAGE_CONFIG));
    const merged = raw ? { ...DEFAULT_SYSTEM_CONFIG, ...raw } : { ...DEFAULT_SYSTEM_CONFIG };
    return normalizeFullConfig(merged);
  },

  /**
   * @param actor.role — si `RH`, `adminWorkflow` entier (étapes + audit) est conservé tel qu’en base :
   * le RH n’édite pas workflow / audit depuis la configuration système (défense en profondeur).
   */
  updateSystemConfig(
    config: Partial<SystemConfig>,
    actor: { id: string; label: string; role?: string },
  ): SystemConfig {
    const current = this.getSystemConfig();
    let merged: SystemConfig = { ...current, ...config };
    if (actor.role === 'RH' && current.adminWorkflow) {
      merged = {
        ...merged,
        adminWorkflow: current.adminWorkflow,
      };
    }
    const next = normalizeFullConfig(merged);
    localStorage.setItem(STORAGE_CONFIG, JSON.stringify(next));
    this.addAuditLog({ action: 'CONFIG_UPDATE', userId: actor.id, userLabel: actor.label, details: JSON.stringify(config) });
    return next;
  },

  getAuditLog(): AuditLogEntry[] {
    const raw = safeJsonParse<AuditLogEntry[]>(localStorage.getItem(STORAGE_AUDIT));
    const list = raw ?? [];
    return list.map((e) => ({ ...e, timestamp: toDate((e as unknown as Record<string, unknown>).timestamp) })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const list = this.getAuditLog();
    const newEntry: AuditLogEntry = { ...entry, id: `audit-${Date.now()}`, timestamp: new Date() };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_AUDIT, JSON.stringify(list.map((e) => ({ ...e, timestamp: e.timestamp.toISOString() }))));
  },
};
