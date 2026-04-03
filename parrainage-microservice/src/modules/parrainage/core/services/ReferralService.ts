import type {
  NotificationAudienceRole,
  NotificationPreferences,
  Referral,
  ReferralHistoryAction,
  ReferralHistoryEntry,
  ReferralNotification,
  ReferralRule,
  ReferralRuleType,
  ReferralStatus,
} from '../models/Referral';
import { AdminService } from './AdminService';
import { isReferrerUnderManager } from '../../shared/utils/orgHierarchy';
import {
  accruedBonusDH,
  totalPotentialBonusDH,
} from '../utils/referralProgram';

const STORAGE_REFERRALS = 'parrainage.referrals.v1';
const STORAGE_HISTORY = 'parrainage.referral.history.v1';
const STORAGE_RULES = 'parrainage.referral.rules.v1';
const STORAGE_NOTIFICATIONS = 'parrainage.referral.notifications.v1';
const STORAGE_NOTIFICATION_PREFS = 'parrainage.referral.notificationPrefs.v1';
const STORAGE_DATA_VERSION = 'parrainage.dataVersion';

/** Bump to re-seed demo dataset (localStorage). */
const DATA_VERSION = '7';

const STATUS_LABEL_FR: Record<ReferralStatus, string> = {
  SUBMITTED: 'En attente',
  APPROVED: 'Validé',
  REJECTED: 'Rejeté',
  REWARDED: 'Prime versée',
};

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

type Actor = { id: string; label: string };

/** 15+ realistic referrals — projects & teams aligned with mock directory. */
const seedReferrals = (): Referral[] => {
  const now = Date.now();
  const base: Omit<Referral, 'createdAt' | 'rewardAmount'>[] = [
    { id: 'ref-1001', referrerId: 'emp-1', referrerName: 'Jean Dupont', projectId: 'proj-1', projectName: 'Alpha Digital', teamId: 'team-a', candidateName: 'Claire Martin', candidateEmail: 'claire.martin@email.com', candidatePhone: '+33 6 12 34 56 78', position: 'Développeur Full-Stack', status: 'SUBMITTED' },
    { id: 'ref-1002', referrerId: 'emp-1', referrerName: 'Jean Dupont', projectId: 'proj-1', projectName: 'Alpha Digital', teamId: 'team-a', candidateName: 'Paul Bernard', candidateEmail: 'paul.bernard@email.com', candidatePhone: '+33 6 98 76 54 32', position: 'Chef de projet', status: 'APPROVED' },
    { id: 'ref-1003', referrerId: 'emp-2', referrerName: 'Sophie Leroy', projectId: 'proj-2', projectName: 'Beta Ops', teamId: 'team-b', candidateName: 'Luc Petit', candidateEmail: 'luc.petit@email.com', candidatePhone: '+33 6 11 22 33 44', position: 'Analyste data', status: 'REJECTED' },
    { id: 'ref-1004', referrerId: 'emp-2', referrerName: 'Sophie Leroy', projectId: 'proj-2', projectName: 'Beta Ops', teamId: 'team-b', candidateName: 'Nadia Kaci', candidateEmail: 'nadia.kaci@email.com', candidatePhone: '+33 6 55 66 77 88', position: 'Développeur', status: 'REWARDED' },
    { id: 'ref-1005', referrerId: 'emp-3', referrerName: 'Thomas Bernard', projectId: 'proj-3', projectName: 'Gamma Cloud', teamId: 'team-c', candidateName: 'Amélie Rousseau', candidateEmail: 'amelie.rousseau@email.com', candidatePhone: '+33 6 44 55 66 77', position: 'DevOps', status: 'SUBMITTED' },
    { id: 'ref-1006', referrerId: 'emp-4', referrerName: 'Julie Moreau', projectId: 'proj-1', projectName: 'Alpha Digital', teamId: 'team-a', candidateName: 'Hugo Garnier', candidateEmail: 'hugo.garnier@email.com', candidatePhone: '+33 6 22 33 44 55', position: 'Développeur', status: 'APPROVED' },
    { id: 'ref-1007', referrerId: 'emp-5', referrerName: 'Karim Benali', projectId: 'proj-2', projectName: 'Beta Ops', teamId: 'team-b', candidateName: 'Sarah Cohen', candidateEmail: 'sarah.cohen@email.com', candidatePhone: '+33 6 77 88 99 00', position: 'Chef de produit', status: 'SUBMITTED' },
    { id: 'ref-1008', referrerId: 'emp-1', referrerName: 'Jean Dupont', projectId: 'proj-3', projectName: 'Gamma Cloud', teamId: 'team-c', candidateName: 'Marc Lefèvre', candidateEmail: 'marc.lefevre@email.com', candidatePhone: '+33 6 10 20 30 40', position: 'Architecte SI', status: 'APPROVED' },
    { id: 'ref-1009', referrerId: 'emp-3', referrerName: 'Thomas Bernard', projectId: 'proj-1', projectName: 'Alpha Digital', teamId: 'team-a', candidateName: 'Élodie Vincent', candidateEmail: 'elodie.vincent@email.com', candidatePhone: '+33 6 31 41 51 61', position: 'Designer UX', status: 'REJECTED' },
    { id: 'ref-1010', referrerId: 'emp-4', referrerName: 'Julie Moreau', projectId: 'proj-2', projectName: 'Beta Ops', teamId: 'team-b', candidateName: 'Nicolas Faure', candidateEmail: 'nicolas.faure@email.com', candidatePhone: '+33 6 52 62 72 82', position: 'Développeur', status: 'REWARDED' },
    { id: 'ref-1011', referrerId: 'emp-5', referrerName: 'Karim Benali', projectId: 'proj-3', projectName: 'Gamma Cloud', teamId: 'team-c', candidateName: 'Inès Hadj', candidateEmail: 'ines.hadj@email.com', candidatePhone: '+33 6 93 83 73 63', position: 'Scrum master', status: 'SUBMITTED' },
    { id: 'ref-1012', referrerId: 'emp-2', referrerName: 'Sophie Leroy', projectId: 'proj-1', projectName: 'Alpha Digital', teamId: 'team-a', candidateName: 'Claire Martin', candidateEmail: 'claire.martin@email.com', candidatePhone: '+33 6 12 34 56 79', position: 'Développeur', status: 'SUBMITTED' },
    { id: 'ref-1013', referrerId: 'emp-1', referrerName: 'Jean Dupont', projectId: 'proj-2', projectName: 'Beta Ops', teamId: 'team-b', candidateName: 'Antoine Dupuis', candidateEmail: 'antoine.dupuis@email.com', candidatePhone: '+33 6 14 24 34 44', position: 'Lead développement', status: 'APPROVED' },
    { id: 'ref-1014', referrerId: 'emp-3', referrerName: 'Thomas Bernard', projectId: 'proj-3', projectName: 'Gamma Cloud', teamId: 'team-c', candidateName: 'Léa Marchand', candidateEmail: 'lea.marchand@email.com', candidatePhone: '+33 6 15 25 35 45', position: 'Ingénieure données', status: 'APPROVED' },
    { id: 'ref-1015', referrerId: 'emp-4', referrerName: 'Julie Moreau', projectId: 'proj-1', projectName: 'Alpha Digital', teamId: 'team-a', candidateName: 'Youssef Alami', candidateEmail: 'youssef.alami@email.com', candidatePhone: '+33 6 16 26 36 46', position: 'Développeur', status: 'APPROVED' },
  ];
  return base.map((r, idx) => ({
    ...r,
    rewardAmount: r.status === 'REWARDED' ? 600 + (idx % 3) * 50 : r.status === 'APPROVED' ? 0 : 0,
    cvUrl: undefined,
    createdAt: new Date(now - idx * 1000 * 60 * 60 * 12 - idx * 86400000),
  }));
};

const seedRules = (): ReferralRule[] => {
  const now = Date.now();
  return [
    { id: 'rule-1', name: 'Récompense Développeur', type: 'REWARD_PER_POSITION', target: 'Développeur', value: 600, status: 'ACTIVE', createdAt: new Date(now - 1000 * 60 * 60 * 24 * 30) },
    { id: 'rule-2', name: 'Récompense Chef de projet', type: 'REWARD_PER_POSITION', target: 'Chef de projet', value: 750, status: 'ACTIVE', createdAt: new Date(now - 1000 * 60 * 60 * 24 * 30) },
    { id: 'rule-3', name: 'Récompense post-probatoire', type: 'REWARD_AFTER_PROBATION', value: 200, status: 'PAUSED', createdAt: new Date(now - 1000 * 60 * 60 * 24 * 25) },
  ];
};

const notifRoles = (t: 'NEW_REFERRAL' | 'STATUS_CHANGED' | 'REFERRAL_REWARDED'): NotificationAudienceRole[] => {
  if (t === 'NEW_REFERRAL') return ['RH', 'ADMIN', 'MANAGER', 'COACH', 'RP'];
  if (t === 'REFERRAL_REWARDED') return ['RH', 'ADMIN', 'PILOTE', 'MANAGER', 'COACH', 'RP'];
  return ['ALL'];
};

const seedHistoryAndNotifications = (referrals: Referral[]) => {
  const baseHistory: ReferralHistoryEntry[] = [];
  const baseNotifications: ReferralNotification[] = [];
  for (const r of referrals) {
    const submittedAt = r.createdAt;
    baseHistory.push({ id: `hist-${r.id}-sub`, referralId: r.id, candidateName: r.candidateName, action: 'SUBMITTED', performedById: r.referrerId, performedByLabel: r.referrerName, createdAt: submittedAt });
    baseNotifications.push({
      id: `nt-${r.id}-sub`,
      type: 'NEW_REFERRAL',
      message: `Nouveau parrainage : ${r.candidateName} (${r.position}) — ${r.projectName}`,
      createdAt: submittedAt,
      read: false,
      referralId: r.id,
      referrerId: r.referrerId,
      targetRoles: notifRoles('NEW_REFERRAL'),
    });
    if (r.status === 'APPROVED') {
      baseHistory.push({ id: `hist-${r.id}-app`, referralId: r.id, candidateName: r.candidateName, action: 'APPROVED', performedById: 'rh-1', performedByLabel: 'RH', createdAt: new Date(submittedAt.getTime() + 1000 * 60 * 60 * 24 * 3) });
      baseNotifications.push({
        id: `nt-${r.id}-app`,
        type: 'STATUS_CHANGED',
        message: `Parrainage validé : ${r.candidateName}`,
        createdAt: new Date(submittedAt.getTime() + 1000 * 60 * 60 * 24 * 3),
        read: false,
        referralId: r.id,
        referrerId: r.referrerId,
        targetRoles: ['ALL'],
      });
    }
    if (r.status === 'REJECTED') {
      baseHistory.push({ id: `hist-${r.id}-rej`, referralId: r.id, candidateName: r.candidateName, action: 'REJECTED', performedById: 'rh-1', performedByLabel: 'RH', createdAt: new Date(submittedAt.getTime() + 1000 * 60 * 60 * 24 * 5), comment: 'Profil non retenu.' });
      baseNotifications.push({
        id: `nt-${r.id}-rej`,
        type: 'STATUS_CHANGED',
        message: `Parrainage refusé : ${r.candidateName}`,
        createdAt: new Date(submittedAt.getTime() + 1000 * 60 * 60 * 24 * 5),
        read: false,
        referralId: r.id,
        referrerId: r.referrerId,
        targetRoles: ['ALL'],
      });
    }
    if (r.status === 'REWARDED') {
      baseHistory.push({ id: `hist-${r.id}-app2`, referralId: r.id, candidateName: r.candidateName, action: 'APPROVED', performedById: 'rh-1', performedByLabel: 'RH', createdAt: new Date(submittedAt.getTime() + 1000 * 60 * 60 * 24 * 4) });
      baseHistory.push({ id: `hist-${r.id}-rew`, referralId: r.id, candidateName: r.candidateName, action: 'REWARDED', performedById: 'rh-1', performedByLabel: 'RH', createdAt: new Date(submittedAt.getTime() + 1000 * 60 * 60 * 24 * 16), rewardAmount: r.rewardAmount });
      baseNotifications.push({
        id: `nt-${r.id}-rew`,
        type: 'REFERRAL_REWARDED',
        message: `Prime enregistrée : ${r.candidateName} (${r.rewardAmount} €)`,
        createdAt: new Date(submittedAt.getTime() + 1000 * 60 * 60 * 24 * 16),
        read: false,
        referralId: r.id,
        referrerId: r.referrerId,
        targetRoles: notifRoles('REFERRAL_REWARDED'),
      });
    }
  }
  return { baseHistory, baseNotifications };
};

const ensureSeeded = () => {
  if (localStorage.getItem(STORAGE_DATA_VERSION) === DATA_VERSION && localStorage.getItem(STORAGE_REFERRALS)) {
    return;
  }
  const referrals = seedReferrals();
  localStorage.setItem(STORAGE_REFERRALS, JSON.stringify(referrals.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))));
  localStorage.setItem(STORAGE_RULES, JSON.stringify(seedRules().map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))));
  const { baseHistory, baseNotifications } = seedHistoryAndNotifications(referrals);
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(baseHistory.map((h) => ({ ...h, createdAt: h.createdAt.toISOString() }))));
  localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(baseNotifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))));
  const prefs: NotificationPreferences = { email: true, inApp: true, systemAlerts: true, referrals: true, approvals: true, payments: true };
  localStorage.setItem(STORAGE_NOTIFICATION_PREFS, JSON.stringify(prefs));
  localStorage.setItem(STORAGE_DATA_VERSION, DATA_VERSION);
};

const loadReferrals = (): Referral[] => {
  ensureSeeded();
  const raw = safeJsonParse<Referral[]>(localStorage.getItem(STORAGE_REFERRALS));
  const list = raw ?? [];
  return list.map((r) => ({ ...r, createdAt: toDate((r as unknown as Record<string, unknown>).createdAt) }));
};

const saveReferrals = (list: Referral[]) => {
  localStorage.setItem(STORAGE_REFERRALS, JSON.stringify(list.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))));
};

const loadHistory = (): ReferralHistoryEntry[] => {
  ensureSeeded();
  const raw = safeJsonParse<ReferralHistoryEntry[]>(localStorage.getItem(STORAGE_HISTORY));
  const list = raw ?? [];
  return list.map((h) => ({ ...h, createdAt: toDate((h as unknown as Record<string, unknown>).createdAt) }));
};

const saveHistory = (list: ReferralHistoryEntry[]) => {
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(list.map((h) => ({ ...h, createdAt: h.createdAt.toISOString() }))));
};

const loadRules = (): ReferralRule[] => {
  ensureSeeded();
  const raw = safeJsonParse<ReferralRule[]>(localStorage.getItem(STORAGE_RULES));
  const list = raw ?? [];
  return list.map((r) => ({ ...r, createdAt: toDate((r as unknown as Record<string, unknown>).createdAt) }));
};

const saveRules = (rules: ReferralRule[]) => {
  localStorage.setItem(STORAGE_RULES, JSON.stringify(rules.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))));
};

const loadNotifications = (): ReferralNotification[] => {
  ensureSeeded();
  const raw = safeJsonParse<ReferralNotification[]>(localStorage.getItem(STORAGE_NOTIFICATIONS));
  const list = raw ?? [];
  return list.map((n) => ({ ...n, createdAt: toDate((n as unknown as Record<string, unknown>).createdAt) }));
};

const saveNotifications = (list: ReferralNotification[]) => {
  localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(list.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))));
};

const loadNotificationPrefs = (): NotificationPreferences => {
  ensureSeeded();
  const raw = safeJsonParse<NotificationPreferences>(localStorage.getItem(STORAGE_NOTIFICATION_PREFS));
  const base = { email: true, inApp: true, systemAlerts: false, referrals: true, approvals: true, payments: true };
  return raw ? { ...base, ...raw } : base;
};

const saveNotificationPrefs = (prefs: NotificationPreferences) => {
  localStorage.setItem(STORAGE_NOTIFICATION_PREFS, JSON.stringify(prefs));
};

const normalizeRuleType = (type: string): ReferralRuleType | null => {
  if (type === 'REWARD_PER_POSITION') return 'REWARD_PER_POSITION';
  if (type === 'REWARD_AFTER_PROBATION') return 'REWARD_AFTER_PROBATION';
  return null;
};

const computeSuggestedReward = (referral: Referral, rules: ReferralRule[]): number => {
  const cfg = AdminService.getSystemConfig();
  const programRules = cfg.referralProgramRules!;
  const fromProgram = accruedBonusDH(referral.createdAt, programRules);
  if (fromProgram > 0) return fromProgram;
  const active = rules.filter((r) => r.status === 'ACTIVE');
  const perPosition = active.filter((r) => r.type === 'REWARD_PER_POSITION');
  const hit = perPosition.find((r) => r.target && r.target === referral.position);
  if (hit) return hit.value;
  const fixed = active.find((r) => r.type === 'REWARD_AFTER_PROBATION');
  return fixed ? fixed.value : totalPotentialBonusDH(programRules);
};

export type RoleFilter = 'PILOTE' | 'RH' | 'ADMIN' | 'MANAGER' | 'COACH' | 'RP' | 'AUDIT';

export const ReferralService = {
  getAllReferrals: (): Referral[] => loadReferrals(),
  getReferralById: (id: string): Referral | undefined => loadReferrals().find((r) => r.id === id),

  updateStatus(id: string, status: ReferralStatus, actor?: Actor, comment?: string): Referral | undefined {
    const list = loadReferrals();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    const current = list[idx];
    if (current.status === 'REWARDED') return current;
    const next: Referral = { ...current, status, rewardAmount: status === 'REWARDED' ? current.rewardAmount : 0 };
    list[idx] = next;
    saveReferrals(list);
    const history = loadHistory();
    history.unshift({ id: `hist-${id}-${Date.now()}`, referralId: id, candidateName: current.candidateName, action: status as ReferralHistoryAction, performedById: actor?.id ?? 'rh-1', performedByLabel: actor?.label ?? 'RH', createdAt: new Date(), ...(comment ? { comment } : {}) });
    saveHistory(history);
    const notifications = loadNotifications();
    notifications.unshift({
      id: `nt-${id}-${Date.now()}`,
      type: 'STATUS_CHANGED',
      message: `Statut : ${STATUS_LABEL_FR[status]} — ${current.candidateName}`,
      createdAt: new Date(),
      read: false,
      referralId: id,
      referrerId: current.referrerId,
      targetRoles: ['ALL'],
    });
    saveNotifications(notifications);
    return next;
  },

  /** Admin / RH : forcer un statut (même logique que updateStatus). */
  forceApprove(id: string, actor?: Actor): Referral | undefined {
    return this.updateStatus(id, 'APPROVED', actor ?? { id: 'admin-1', label: 'Administrateur' });
  },

  forceReject(id: string, actor?: Actor, reason?: string): Referral | undefined {
    return this.updateStatus(id, 'REJECTED', actor ?? { id: 'admin-1', label: 'Administrateur' }, reason ?? 'Rejet opérationnel');
  },

  updateReferralManual(
    id: string,
    patch: Partial<Pick<Referral, 'candidateName' | 'candidateEmail' | 'candidatePhone' | 'position' | 'projectName' | 'status' | 'rewardAmount'>>,
    actor?: Actor,
  ): Referral | undefined {
    const list = loadReferrals();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    const current = list[idx];
    const next: Referral = { ...current, ...patch };
    list[idx] = next;
    saveReferrals(list);
    AdminService.addAuditLog({
      action: 'CONFIG_UPDATE',
      userId: actor?.id ?? 'admin-1',
      userLabel: actor?.label ?? 'Administrateur',
      details: `Modification manuelle du parrainage ${id} : ${JSON.stringify(patch)}`,
    });
    return next;
  },

  assignReward(id: string, amount: number, actor?: Actor): Referral | undefined {
    const list = loadReferrals();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    const current = list[idx];
    if (current.status !== 'APPROVED') return current;
    const next: Referral = { ...current, status: 'REWARDED', rewardAmount: amount };
    list[idx] = next;
    saveReferrals(list);
    const history = loadHistory();
    history.unshift({ id: `hist-${id}-rew-${Date.now()}`, referralId: id, candidateName: current.candidateName, action: 'REWARDED', performedById: actor?.id ?? 'rh-1', performedByLabel: actor?.label ?? 'RH', createdAt: new Date(), rewardAmount: amount });
    saveHistory(history);
    const notifications = loadNotifications();
    notifications.unshift({
      id: `nt-${id}-rew-${Date.now()}`,
      type: 'REFERRAL_REWARDED',
      message: `Prime versée : ${current.candidateName} (${amount} €)`,
      createdAt: new Date(),
      read: false,
      referralId: id,
      referrerId: current.referrerId,
      targetRoles: ['RH', 'ADMIN', 'PILOTE', 'MANAGER', 'COACH', 'RP'],
    });
    saveNotifications(notifications);
    return next;
  },

  getHistory: (): ReferralHistoryEntry[] => loadHistory().slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  getRules: (): ReferralRule[] => loadRules().slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),

  upsertRule(rule: Omit<ReferralRule, 'createdAt'> & { id?: string; createdAt?: Date }): ReferralRule {
    const rules = loadRules();
    const normalizedType = normalizeRuleType(rule.type);
    if (!normalizedType) throw new Error('Type de règle non reconnu.');
    const normalizedStatus: ReferralRule['status'] = rule.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED';
    if (rule.id) {
      const idx = rules.findIndex((r) => r.id === rule.id);
      if (idx !== -1) {
        const updated: ReferralRule = { ...rules[idx], ...rule, type: normalizedType, status: normalizedStatus };
        rules[idx] = updated;
        saveRules(rules);
        return updated;
      }
    }
    const created: ReferralRule = { id: `rule-${Date.now()}`, name: rule.name, type: normalizedType, value: rule.value, target: rule.target, status: normalizedStatus, createdAt: new Date() };
    rules.unshift(created);
    saveRules(rules);
    return created;
  },

  deleteRule: (ruleId: string): boolean => {
    const rules = loadRules();
    const next = rules.filter((r) => r.id !== ruleId);
    saveRules(next);
    return next.length !== rules.length;
  },

  getNotificationPreferences: (): NotificationPreferences => loadNotificationPrefs(),
  updateNotificationPreferences: (prefs: NotificationPreferences) => {
    saveNotificationPrefs({ ...loadNotificationPrefs(), ...prefs });
  },
  getNotifications: (): ReferralNotification[] => loadNotifications().slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),

  /** Filtrage par rôle + périmètre PM (projet). */
  getNotificationsForRole(role: RoleFilter, user: { id: string; projectId?: string }): ReferralNotification[] {
    const all = this.getNotifications();
    const referrals = loadReferrals();
    return all.filter((n) => {
      const targets = n.targetRoles;
      if (targets?.length && !targets.includes('ALL')) {
        if (!targets.includes(role)) return false;
      }
      if (role === 'PILOTE') {
        if (n.referrerId && n.referrerId !== user.id) return false;
        if (n.referralId) {
          const ref = referrals.find((r) => r.id === n.referralId);
          if (ref && ref.referrerId !== user.id) return false;
        }
      }
      if ((role === 'MANAGER' || role === 'COACH') && n.referralId) {
        const ref = referrals.find((r) => r.id === n.referralId);
        if (ref && !isReferrerUnderManager(user.id, ref.referrerId)) return false;
      }
      return true;
    });
  },

  markNotificationAsRead: (id: string) => {
    const list = loadNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], read: true };
      saveNotifications(list);
    }
  },
  markAllNotificationsAsRead: () => {
    saveNotifications(loadNotifications().map((n) => ({ ...n, read: true })));
  },
  getSuggestedReward: (referralId: string): number => {
    const referral = loadReferrals().find((r) => r.id === referralId);
    return referral ? computeSuggestedReward(referral, loadRules()) : 0;
  },

  /** Enveloppe totale (DH) selon le mode programme actif — affichage pilote / RH. */
  getTotalReferralBonusPotentialDH: (referralId: string): number => {
    const referral = loadReferrals().find((r) => r.id === referralId);
    if (!referral) return 0;
    const cfg = AdminService.getSystemConfig();
    return totalPotentialBonusDH(cfg.referralProgramRules!);
  },

  /** Tranches dues à ce jour (DH) selon l’ancienneté du dossier. */
  getAccruedReferralBonusDH: (referralId: string): number => {
    const referral = loadReferrals().find((r) => r.id === referralId);
    if (!referral) return 0;
    const cfg = AdminService.getSystemConfig();
    return accruedBonusDH(referral.createdAt, cfg.referralProgramRules!);
  },

  submitReferral(data: { referrerId: string; referrerName: string; candidateName: string; candidateEmail: string; candidatePhone: string; position: string; project?: string; notes?: string }): Referral {
    const list = loadReferrals();
    const id = `ref-${Date.now()}`;
    const created: Referral = {
      id,
      referrerId: data.referrerId,
      referrerName: data.referrerName,
      projectId: 'proj-1',
      projectName: data.project ?? 'Projet',
      teamId: 'team-a',
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      candidatePhone: data.candidatePhone,
      position: data.position,
      status: 'SUBMITTED',
      rewardAmount: 0,
      createdAt: new Date(),
    };
    list.unshift(created);
    saveReferrals(list);
    const history = loadHistory();
    history.unshift({ id: `hist-${id}-sub`, referralId: id, candidateName: data.candidateName, action: 'SUBMITTED', performedById: data.referrerId, performedByLabel: data.referrerName, createdAt: created.createdAt });
    saveHistory(history);
    const notifications = loadNotifications();
    notifications.unshift({
      id: `nt-${id}-sub`,
      type: 'NEW_REFERRAL',
      message: `Nouveau parrainage : ${data.candidateName} (${data.position})`,
      createdAt: created.createdAt,
      read: false,
      referralId: id,
      referrerId: data.referrerId,
      targetRoles: ['RH', 'ADMIN', 'MANAGER', 'COACH', 'RP'],
    });
    saveNotifications(notifications);
    return created;
  },

  detectAnomalies(): {
    duplicateCandidates: { email: string; referrals: Referral[] }[];
    suspiciousEmails: { email: string; count: number; referralIds: string[] }[];
  } {
    const referrals = loadReferrals();
    const byEmail = new Map<string, Referral[]>();
    for (const r of referrals) {
      const k = r.candidateEmail.trim().toLowerCase();
      if (!byEmail.has(k)) byEmail.set(k, []);
      byEmail.get(k)!.push(r);
    }
    const duplicateCandidates = [...byEmail.entries()]
      .filter(([, arr]) => arr.length > 1)
      .map(([email, arr]) => ({ email, referrals: arr }));
    const suspiciousEmails = [...byEmail.entries()]
      .filter(([, arr]) => arr.length > 1)
      .map(([email, arr]) => ({ email, count: arr.length, referralIds: arr.map((x) => x.id) }));
    return { duplicateCandidates, suspiciousEmails };
  },

  exportDataSnapshot(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        referrals: loadReferrals(),
        rules: loadRules(),
        history: loadHistory(),
        notifications: loadNotifications(),
        notificationPreferences: loadNotificationPrefs(),
        systemConfig: AdminService.getSystemConfig(),
        auditLog: AdminService.getAuditLog(),
      },
      null,
      2,
    );
  },
};
