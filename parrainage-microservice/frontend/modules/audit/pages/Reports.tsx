import React from 'react';
import { Button } from '../../../shared/components/Button';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-50">Rapports d’audit</h2>
      <div className="card-navy p-4 md:p-5 space-y-3 text-xs text-slate-400">
        <p>
          Exports disponibles pour les équipes d’audit et de sécurité. Les rapports incluent les
          actions sur les parrainages, les changements de configuration et les activités sensibles.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button">Exporter CSV</Button>
          <Button type="button">Exporter PDF</Button>
        </div>
      </div>
    </div>
  );
};

