import React, { useState, useMemo } from 'react';
import { ReferralService } from '../../services/ReferralService';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { StatusBadge } from '../../components/StatusBadge';
import { FiltersBar } from '../../components/FiltersBar';
import { Timeline } from '../../../components/Timeline';
import type { ReferralStatus } from '../../models/Referral';

const actionToTimelineItem = (
  action: string,
  date: Date,
  comment?: string,
): { id: string; label: string; status: 'done' | 'current' | 'upcoming'; date?: string; description?: string } => {
  const labels: Record<string, string> = {
    SUBMITTED: 'En attente',
    APPROVED: 'Validé',
    REJECTED: 'Rejeté',
    REWARDED: 'Prime versée',
  };
  return {
    id: `t-${action}-${date.getTime()}`,
    label: labels[action] ?? action,
    status: 'done',
    date: date.toLocaleDateString('fr-FR'),
    description: comment,
  };
};

export const PiloteMyReferrals: React.FC = () => {
  const { user } = useAuth();
  const referrerId = user?.id ?? '';
  const allReferrals = ReferralService.getAllReferrals();
  const myReferrals = allReferrals.filter((r) => r.referrerId === referrerId);

  const [status, setStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('3m');
  const [selectedId, setSelectedId] = useState<string | null>(
    myReferrals[0]?.id ?? null,
  );

  const filtered = myReferrals.filter((r) =>
    status === 'all' ? true : r.status === status,
  );

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  const timelineItems = useMemo(() => {
    if (!selected) return [];
    const history = ReferralService.getHistory().filter(
      (h) => h.referralId === selected.id,
    );
    return history
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((h) => actionToTimelineItem(h.action, h.createdAt, h.comment));
  }, [selected]);

  return (
    <div className="space-y-4">
      <FiltersBar
        status={status}
        setStatus={setStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-navy p-3 md:p-4 lg:col-span-2 overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-navy-800">
                <th className="py-2 pr-3">Candidat</th>
                <th className="py-2 px-3">Poste</th>
                <th className="py-2 px-3">Parrain</th>
                <th className="py-2 px-3">Projet</th>
                <th className="py-2 px-3">Soumis le</th>
                <th className="py-2 pl-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ref) => (
                <tr
                  key={ref.id}
                  className={`border-b border-navy-900/80 hover:bg-navy-800/40 cursor-pointer ${
                    ref.id === selected?.id ? 'bg-navy-800/40' : ''
                  }`}
                  onClick={() => setSelectedId(ref.id)}
                >
                  <td className="py-2 pr-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">
                        {ref.candidateName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {ref.id}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-slate-200">{ref.position}</td>
                  <td className="py-2 px-3 text-slate-200">
                    {ref.referrerName}
                  </td>
                  <td className="py-2 px-3 text-slate-200">
                    {ref.projectName ?? (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-200">
                    {ref.createdAt.toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-2 pl-3 text-right">
                    <StatusBadge status={ref.status as ReferralStatus} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-xs text-slate-500"
                  >
                    Aucun parrainage ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="card-navy p-4">
            {selected ? (
              <>
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                    Détail du parrainage
                  </p>
                  <p className="text-sm font-semibold text-slate-100">
                    {selected.candidateName}
                  </p>
                  <p className="text-xs text-slate-400">{selected.position}</p>
                </div>
                <Timeline items={timelineItems} />
              </>
            ) : (
              <p className="text-xs text-slate-500">
                Sélectionnez un parrainage dans la liste pour visualiser la
                chronologie.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
