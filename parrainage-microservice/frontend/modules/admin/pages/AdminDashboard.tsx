import React from 'react';
import { KpiCard } from '../../../../parrainage-service/src/components/KpiCard';
import { ActivityFeed } from '../../../../parrainage-service/src/components/ActivityFeed';
import { MOCK_ACTIVITY } from '../../../../parrainage-service/src/services/mockData';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <KpiCard label="API Health" value="OK" accent="green" />
          <KpiCard label="Erreurs (24h)" value={3} accent="red" />
          <KpiCard label="Requêtes / min" value={128} accent="blue" />
        </div>
        <div className="card-navy p-4 md:p-5 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-100">Vue technique globale</p>
          <p>
            Surveillez la disponibilité du microservice de parrainage, les pics de charge et les
            comportements anormaux. Utilisez cette vue pour détecter les incidents avant qu’ils
            n’impactent les utilisateurs métiers.
          </p>
        </div>
      </div>
      <ActivityFeed items={MOCK_ACTIVITY} />
    </div>
  );
};

