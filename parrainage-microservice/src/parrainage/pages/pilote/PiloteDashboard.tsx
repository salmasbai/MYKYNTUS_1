import React from 'react';
import { ReferralService } from '../../services/ReferralService';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { KpiCard } from '../../../components/KpiCard';
import { StatusBadge } from '../../components/StatusBadge';
import { useNavigation } from '../../../../frontend/app/providers/NavigationProvider';

export const PiloteDashboard: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentView } = useNavigation();
  const referrerId = user?.id ?? '';
  const allReferrals = ReferralService.getAllReferrals();
  const myReferrals = allReferrals.filter((r) => r.referrerId === referrerId);

  const active = myReferrals.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'APPROVED',
  ).length;
  const accepted = myReferrals.filter(
    (r) => r.status === 'APPROVED' || r.status === 'REWARDED',
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard label="Parrainages soumis" value={myReferrals.length} />
        <KpiCard label="En cours" value={active} accent="yellow" />
        <KpiCard label="Validés" value={accepted} accent="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-navy p-4 md:p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Historique de vos parrainages
            </h2>
            <button
              type="button"
              onClick={() => setCurrentView('pilote-submit')}
              className="text-[11px] text-soft-blue hover:underline"
            >
              + Soumettre un nouveau parrainage
            </button>
          </div>
          <div className="space-y-2 text-xs">
            {myReferrals.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-navy-800 bg-navy-900/60 px-3 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <p className="font-medium text-slate-100">
                    {r.candidateName}{' '}
                    <span className="text-[11px] text-slate-500">
                      ({r.position})
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Soumis le {r.createdAt.toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
            {myReferrals.length === 0 && (
              <p className="text-xs text-slate-500">
                Vous n'avez pas encore soumis de parrainage. Soyez le premier à
                recommander un talent !
              </p>
            )}
          </div>
        </div>

        <div className="card-navy p-4 md:p-5 text-xs space-y-2">
          <h3 className="text-sm font-semibold text-slate-50">
            Comment fonctionne le programme ?
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Vous soumettez un profil via le formulaire dédié.</li>
            <li>Les équipes RH analysent la candidature.</li>
            <li>Le candidat passe un ou plusieurs entretiens.</li>
            <li>
              En cas d'embauche et de validation de la période d'essai, votre
              prime est versée.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
