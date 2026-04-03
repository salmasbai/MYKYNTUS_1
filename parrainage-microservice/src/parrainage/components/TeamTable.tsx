import React from 'react';
import { Search, Users } from 'lucide-react';
import type { Referral } from '../models/Referral';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  projectName: string;
  referralCount: number;
  successCount: number;
}

interface TeamTableProps {
  members: TeamMember[];
  loading?: boolean;
  onSearch?: (q: string) => void;
}

export const TeamTable: React.FC<TeamTableProps> = ({
  members,
  loading,
  onSearch,
}) => {
  if (loading) {
    return (
      <div className="card-navy p-10 text-center text-slate-500 text-sm">
        Chargement…
      </div>
    );
  }
  if (members.length === 0) {
    return (
      <div className="card-navy p-12 text-center">
        <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-slate-600" />
        </div>
        <h4 className="text-slate-300 font-medium">Aucun membre</h4>
        <p className="text-slate-500 text-sm mt-1">Aucune donnée à afficher</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onSearch && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="search"
            placeholder="Rechercher…"
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-navy-900 border border-navy-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      )}
      <div className="card-navy overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-800/50 border-b border-navy-800">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Projet</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Parrainages</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Taux de succès</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-navy-800/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-200">{m.name}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{m.role}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{m.projectName}</td>
                <td className="px-6 py-4 text-sm text-slate-300">{m.referralCount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-sm font-medium ${
                      (m.referralCount > 0 ? m.successCount / m.referralCount : 0) >= 0.5
                        ? 'text-emerald-500'
                        : 'text-slate-400'
                    }`}
                  >
                      {m.referralCount > 0
                        ? Math.round((m.successCount / m.referralCount) * 100)
                        : 0}
                      %
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export function buildTeamMembersFromReferrals(
  referrals: Referral[],
): TeamMember[] {
  const byReferrer = new Map<string, { name: string; projectName: string; total: number; success: number }>();
  referrals.forEach((r) => {
    const cur = byReferrer.get(r.referrerId);
    const success = r.status === 'APPROVED' || r.status === 'REWARDED' ? 1 : 0;
    if (cur) {
      cur.total++;
      cur.success += success;
    } else {
      byReferrer.set(r.referrerId, {
        name: r.referrerName,
        projectName: r.projectName,
        total: 1,
        success,
      });
    }
  });
  return Array.from(byReferrer.entries()).map(([id, d]) => ({
    id,
    name: d.name,
    role: 'Collaborateur',
    projectName: d.projectName,
    referralCount: d.total,
    successCount: d.success,
  }));
}
