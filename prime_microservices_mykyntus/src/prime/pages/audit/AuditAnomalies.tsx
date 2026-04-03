import { useEffect, useMemo, useState } from 'react';
import { PrimeCard } from '../../components/PrimeCard';
import { PrimeTable } from '../../components/PrimeTable';
import { AuditPrimeService } from '../../services/audit-prime.service';
import type { AuditAnomaly } from '../../mock-data/audit';

export function AuditAnomalies() {
  const [anomalies, setAnomalies] = useState<AuditAnomaly[]>([]);
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    AuditPrimeService.getAnomalies()
      .then((data) => {
        setAnomalies(data);
        const initial: Record<string, boolean> = {};
        data.forEach((a) => {
          initial[a.id] = false;
        });
        setVerified(initial);
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const byType: Record<string, AuditAnomaly[]> = {};
    anomalies.forEach((a) => {
      byType[a.type] = byType[a.type] ?? [];
      byType[a.type].push(a);
    });
    return byType;
  }, [anomalies]);

  const toggleVerified = (id: string) => {
    setVerified((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <PrimeCard title="Anomalies">
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        </div>
      </PrimeCard>
    );
  }

  const types = ['Incohérence', 'Erreur de calcul', 'Validation manquante'] as const;

  return (
    <div className="space-y-6">
      <PrimeCard title="Anomalies">
        <div className="text-xs text-slate-400">
          Marquer comme vérifié est une action UI uniquement (aucune donnée n'est modifiée).
        </div>
      </PrimeCard>

      {types.map((type) => {
        const rows = grouped[type] ?? [];
        return (
          <PrimeCard key={type} title={type}>
            {rows.length === 0 ? (
              <div className="text-sm text-slate-400 py-4">Aucune anomalie de ce type.</div>
            ) : (
              <PrimeTable<AuditAnomaly>
                data={rows}
                keyExtractor={(item) => item.id}
                emptyMessage="Aucune anomalie."
                columns={[
                  { header: 'Description', cell: (item) => <span className="text-slate-300">{item.description}</span> },
                  { header: 'Validation concernée', cell: (item) => <span className="text-slate-400">{item.validationId ?? '-'}</span> },
                  {
                    header: 'Statut',
                    cell: (item) => (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'Ouverte'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    ),
                  },
                  {
                    header: 'Vérifié',
                    className: 'text-right',
                    cell: (item) => {
                      const isVerified = !!verified[item.id];
                      return (
                        <button
                          type="button"
                          onClick={() => toggleVerified(item.id)}
                          className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                            isVerified
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-navy-900 border-default text-slate-300 hover:bg-navy-800'
                          }`}
                        >
                          {isVerified ? 'Vérifié' : 'Marquer vérifié'}
                        </button>
                      );
                    },
                  },
                ]}
              />
            )}
          </PrimeCard>
        );
      })}
    </div>
  );
}

