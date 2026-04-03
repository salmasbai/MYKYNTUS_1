import React from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { usePayments } from '@parrainage/core/hooks/usePayments';
import { AccessDenied } from '../../components/AccessDenied';

export const AdminPayments: React.FC = () => {
  const { user } = useAuth();
  const { items, loading, markPaid } = usePayments(user);

  if (user?.role === 'MANAGER' || user?.role === 'COACH') {
    return <AccessDenied backTo={{ to: '/parrainage/pm/dashboard', label: 'Retour au tableau de bord équipe' }} />;
  }
  if (user?.role === 'RH') {
    return (
      <AccessDenied
        message="La gestion des paiements n’est pas disponible pour le rôle RH."
        backTo={{ to: '/parrainage/rh/dashboard', label: 'Retour au tableau de bord RH' }}
      />
    );
  }

  return (
    <section className="flex-1 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Gestion des paiements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Suivi des primes et marquage comme versé.
        </p>
      </div>

      <div className="card-navy overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-800/50 border-b border-navy-800">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Parrain</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidat</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Chargement…</td>
              </tr>
            ) : (
              items.map(({ referral: r, amount, isPaid }) => (
                <tr key={r.id} className="hover:bg-navy-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-200">{r.referrerName}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{r.candidateName}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{amount} €</td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${isPaid ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {isPaid ? 'Versé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!isPaid && (
                      <button
                        onClick={() => markPaid(r.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-500 transition-all"
                      >
                        Marquer versé
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <h4 className="text-slate-300 font-medium">Aucune prime</h4>
                  <p className="text-slate-500 text-sm mt-1">Aucune donnée à afficher</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 border border-navy-800 rounded-lg text-sm text-slate-300 hover:bg-navy-800 transition-all"
          title="Exporter les données (interface préparée)"
        >
          <Download className="w-4 h-4" />
          Exporter les données
        </button>
      </div>
    </section>
  );
};
