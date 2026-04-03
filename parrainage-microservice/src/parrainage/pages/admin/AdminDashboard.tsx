import React, { useMemo } from 'react';
import { AlertTriangle, Wrench, Activity } from 'lucide-react';
import { ReferralService } from '@parrainage/core/services/ReferralService';
import { AdminService } from '@parrainage/core/services/AdminService';
import { KPIStats } from '../../components/KPIStats';
import { AccessDenied } from '../../components/AccessDenied';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { useNavigation } from '../../../../frontend/app/providers/NavigationProvider';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentView } = useNavigation();

  if (user?.role === 'MANAGER' || user?.role === 'COACH') {
    return <AccessDenied backTo={{ to: '#', label: 'Retour au tableau de bord équipe' }} />;
  }

  const referrals = ReferralService.getAllReferrals();
  const config = AdminService.getSystemConfig();
  const threshold = config.pendingReferralAlertThreshold ?? 5;

  const pending = useMemo(() => referrals.filter((r) => r.status === 'SUBMITTED').length, [referrals]);
  const approvedUnpaid = useMemo(
    () => referrals.filter((r) => r.status === 'APPROVED' && r.rewardAmount === 0).length,
    [referrals],
  );
  const overdueStyle = pending > threshold || approvedUnpaid > 0;

  return (
    <section className="flex-1 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50 flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-500" />
            Centre opérationnel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vue consolidée : files d’attente, récompenses et indicateurs clés.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => setCurrentView('admin-tools')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-medium hover:bg-amber-500/20 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            Outils administrateur
          </button>
        )}
      </div>

      {(pending > threshold || approvedUnpaid > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pending > threshold && (
            <div className="card-navy p-4 border-amber-500/40 bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-200 font-semibold text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                File d’attente élevée
              </div>
              <p className="text-sm text-slate-300">
                {pending} parrainage(s) en attente — seuil configuré : {threshold}.
              </p>
              <button
                type="button"
                onClick={() => setCurrentView(user?.role === 'RH' ? 'rh-management' : 'admin-tools')}
                className="text-xs text-blue-400 hover:underline mt-2 inline-block"
              >
                {user?.role === 'RH' ? 'Ouvrir la gestion' : 'Ouvrir les outils administrateur'}
              </button>
            </div>
          )}
          {approvedUnpaid > 0 && (
            <div className="card-navy p-4 border-orange-500/40 bg-orange-500/5">
              <div className="flex items-center gap-2 text-orange-200 font-semibold text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                Récompenses à traiter
              </div>
              <p className="text-sm text-slate-300">
                {approvedUnpaid} parrainage(s) validé(s) sans prime enregistrée.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (user?.role === 'ADMIN') setCurrentView('admin-payments');
                  else if (user?.role === 'RH') setCurrentView('rh-management');
                  else setCurrentView('admin-tools');
                }}
                className="text-xs text-blue-400 hover:underline mt-2 inline-block"
              >
                {user?.role === 'ADMIN'
                  ? 'Ouvrir les paiements'
                  : user?.role === 'RH'
                    ? 'Gestion des parrainages'
                    : 'Outils administrateur'}
              </button>
            </div>
          )}
        </div>
      )}

      <KPIStats
        items={[
          { label: 'Total parrainages', value: referrals.length, accent: 'blue' },
          { label: 'En attente', value: pending, accent: overdueStyle && pending > threshold ? 'orange' : 'orange' },
          { label: 'Validés', value: referrals.filter((r) => r.status === 'APPROVED').length, accent: 'green' },
          { label: 'Récompenses enregistrées', value: referrals.filter((r) => r.status === 'REWARDED').length, accent: 'purple' },
          { label: 'À verser (estim.)', value: approvedUnpaid, accent: approvedUnpaid > 0 ? 'red' : 'green' },
        ]}
      />

      <div className="card-navy p-6">
        <h2 className="text-sm font-semibold text-slate-200 mb-2">État plateforme</h2>
        <p className="text-sm text-slate-500">
          {user?.role === 'ADMIN' ? (
            <>
              Outils avancés (recherche, débogage) :{' '}
              <button type="button" onClick={() => setCurrentView('admin-tools')} className="text-blue-400 hover:underline">
                Outils administrateur
              </button>
              .{' '}
            </>
          ) : (
            <>Vue RH : gestion des parrainages depuis le menu. </>
          )}
          Journal d&apos;audit : <button type="button" onClick={() => setCurrentView('admin-audit')} className="text-blue-400 hover:underline">consulter</button>
          {' · '}
          <button type="button" onClick={() => setCurrentView('notifications')} className="text-blue-400 hover:underline">notifications</button>.
        </p>
      </div>
    </section>
  );
};
