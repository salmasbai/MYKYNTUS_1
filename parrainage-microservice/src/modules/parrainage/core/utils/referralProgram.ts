import type { ReferralProgramRules, ReferralBonusTier, SystemConfig } from '../models/SystemConfig';

export const DEFAULT_REFERRAL_PROGRAM_RULES: ReferralProgramRules = {
  activeMode: 'STANDARD',
  standardTiers: [{ id: 'tier-std-1', amountDH: 1500, afterMonths: 6 }],
  criticalPeriodTiers: [
    { id: 'tier-crit-1', amountDH: 500, afterMonths: 3 },
    { id: 'tier-crit-2', amountDH: 1000, afterMonths: 6 },
  ],
};

function clampTier(t: Partial<ReferralBonusTier>, fallback: ReferralBonusTier): ReferralBonusTier {
  return {
    id: typeof t.id === 'string' && t.id ? t.id : fallback.id,
    amountDH: Number.isFinite(t.amountDH) && t.amountDH! >= 0 ? t.amountDH! : fallback.amountDH,
    afterMonths: Number.isFinite(t.afterMonths) && t.afterMonths! >= 0 ? Math.floor(t.afterMonths!) : fallback.afterMonths,
  };
}

function normalizeTierList(raw: unknown, fallback: ReferralBonusTier[]): ReferralBonusTier[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback.map((t) => ({ ...t }));
  const cleaned = raw.map((x, i) =>
    clampTier(x as Partial<ReferralBonusTier>, fallback[Math.min(i, fallback.length - 1)] ?? fallback[0]),
  );
  return cleaned.sort((a, b) => a.afterMonths - b.afterMonths || a.id.localeCompare(b.id));
}

export function normalizeReferralProgramRules(cfg: SystemConfig): ReferralProgramRules {
  const base = DEFAULT_REFERRAL_PROGRAM_RULES;
  const incoming = cfg.referralProgramRules;
  if (!incoming) {
    const migratedStd: ReferralBonusTier[] = [
      {
        id: 'tier-std-1',
        amountDH: cfg.defaultBonusAmount > 0 ? cfg.defaultBonusAmount : base.standardTiers[0].amountDH,
        afterMonths: cfg.minDurationMonths > 0 ? cfg.minDurationMonths : base.standardTiers[0].afterMonths,
      },
    ];
    return {
      activeMode: 'STANDARD',
      standardTiers: normalizeTierList(migratedStd, base.standardTiers),
      criticalPeriodTiers: normalizeTierList(base.criticalPeriodTiers, base.criticalPeriodTiers),
    };
  }
  const mode = incoming.activeMode === 'CRITICAL_PERIOD' ? 'CRITICAL_PERIOD' : 'STANDARD';
  return {
    activeMode: mode,
    standardTiers: normalizeTierList(incoming.standardTiers, base.standardTiers),
    criticalPeriodTiers: normalizeTierList(incoming.criticalPeriodTiers, base.criticalPeriodTiers),
  };
}

export function syncLegacyBonusFields(rules: ReferralProgramRules): {
  defaultBonusAmount: number;
  minDurationMonths: number;
} {
  const tiers = rules.activeMode === 'CRITICAL_PERIOD' ? rules.criticalPeriodTiers : rules.standardTiers;
  const sum = tiers.reduce((s, t) => s + t.amountDH, 0);
  const minM = tiers.length ? Math.min(...tiers.map((t) => t.afterMonths)) : 6;
  return {
    defaultBonusAmount: sum > 0 ? sum : DEFAULT_REFERRAL_PROGRAM_RULES.standardTiers[0].amountDH,
    minDurationMonths: minM,
  };
}

export function getActiveTiersSorted(rules: ReferralProgramRules): ReferralBonusTier[] {
  const list = rules.activeMode === 'CRITICAL_PERIOD' ? rules.criticalPeriodTiers : rules.standardTiers;
  return [...list].sort((a, b) => a.afterMonths - b.afterMonths);
}

export function wholeMonthsSince(start: Date, end: Date = new Date()): number {
  let m = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) m -= 1;
  return Math.max(0, m);
}

/** Somme des tranches dont le délai est atteint (versements dus à ce jour). */
export function accruedBonusDH(createdAt: Date, rules: ReferralProgramRules, now: Date = new Date()): number {
  const months = wholeMonthsSince(createdAt, now);
  return getActiveTiersSorted(rules)
    .filter((t) => months >= t.afterMonths)
    .reduce((s, t) => s + t.amountDH, 0);
}

/** Enveloppe totale du mode actif (affichage « prime potentielle »). */
export function totalPotentialBonusDH(rules: ReferralProgramRules): number {
  return getActiveTiersSorted(rules).reduce((s, t) => s + t.amountDH, 0);
}

export function nextTierId(): string {
  return `tier-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
