import type { AccessLogRow } from './auditDemoData';

export type AccessRowView = AccessLogRow & { bruteForce: boolean };

function parseDt(d: string): number {
  const [date, time] = d.split(' ');
  if (!date || !time) return 0;
  return new Date(`${date}T${time}`).getTime();
}

/** Marque les lignes où ≥5 échecs pour le même compte + IP dans une fenêtre de 2 min (glissante). */
export function enrichAccessWithBruteForce(rows: AccessLogRow[]): AccessRowView[] {
  const sorted = [...rows].sort((a, b) => a.datetime.localeCompare(b.datetime));
  const WINDOW_MS = 2 * 60 * 1000;
  const MIN_FAILS = 5;

  return sorted.map((row, i) => {
    let bruteForce = row.securityFlag === 'WARNING';
    const isFail = !row.success && (row.eventType === 'LOGIN_FAILURE' || row.eventType === 'SUSPICIOUS');
    if (isFail) {
      const t = parseDt(row.datetime);
      let count = 0;
      for (let j = i; j >= 0; j--) {
        const r = sorted[j];
        if (r.user !== row.user || r.ip !== row.ip) continue;
        const fail = !r.success && (r.eventType === 'LOGIN_FAILURE' || r.eventType === 'SUSPICIOUS');
        if (!fail) continue;
        const tj = parseDt(r.datetime);
        if (t - tj > WINDOW_MS) break;
        count += 1;
      }
      if (count >= MIN_FAILS) bruteForce = true;
    }
    return { ...row, bruteForce };
  });
}

/** Libellé type connexion pour colonne « Type » */
export function accessTypeLabel(r: AccessLogRow): string {
  if (r.eventType === 'LOGOUT') return 'Logout';
  if (r.eventType === 'LOGIN_SUCCESS' || r.eventType === 'LOGIN_FAILURE') return 'Login';
  if (r.eventType === 'SUSPICIOUS') return 'Tentative';
  return r.label;
}
