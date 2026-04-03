import React, { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../../../../src/components/KpiCard';
import { ReferralService } from '../../../../src/parrainage/services/ReferralService';
import type { Referral, ReferralStatus } from '../../../../src/parrainage/models/Referral';

const countStatus = (list: { status: ReferralStatus }[], status: ReferralStatus) =>
  list.filter((r) => r.status === status).length;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setReferrals(ReferralService.getAllReferrals());
      setLoading(false);
    }, 180);
    return () => window.clearTimeout(t);
  }, []);

  const kpis = useMemo(() => {
    const total = referrals.length;
    const pending = countStatus(referrals, 'SUBMITTED') + countStatus(referrals, 'APPROVED');
    const approved = countStatus(referrals, 'APPROVED');
    const rewards = referrals.filter((r) => r.status === 'REWARDED').reduce((s, r) => s + (r.rewardAmount || 0), 0);
    return { total, pending, approved, rewards };
  }, [referrals]);

  if (loading) {
    return <div className="card-navy p-10 text-center text-sm text-slate-500">Chargement…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard label="Parrainages totaux" value={kpis.total} />
        <KpiCard label="En cours" value={kpis.pending} accent="yellow" />
        <KpiCard label="Validés" value={kpis.approved} accent="green" />
      </div>
      <div className="mt-4">
        <KpiCard label="Total primes" value={kpis.rewards} accent="red" />
      </div>
    </div>
  );
}


