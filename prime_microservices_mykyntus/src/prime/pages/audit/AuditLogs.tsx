import { useEffect, useMemo, useState } from 'react';
import { PrimeCard } from '../../components/PrimeCard';
import { PrimeTable } from '../../components/PrimeTable';
import { AuditPrimeService } from '../../services/audit-prime.service';
import type { AuditTrailLog } from '../../mock-data/audit';

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditTrailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    AuditPrimeService.getAuditTrailLogs()
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => `${l.user} ${l.action} ${l.detail}`.toLowerCase().includes(q));
  }, [logs, search]);

  if (loading) {
    return (
      <PrimeCard title="Audit Trail (logs)">
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        </div>
      </PrimeCard>
    );
  }

  return (
    <div className="space-y-6">
      <PrimeCard title="Audit Trail (logs)">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">Recherche (utilisateur / action / détail)</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              placeholder="ex: validation, op1, RP..."
            />
          </div>
          <div className="text-xs text-slate-400">{filtered.length} entrées</div>
        </div>
      </PrimeCard>

      <PrimeCard title="Détail des actions">
        <PrimeTable<AuditTrailLog>
          data={filtered}
          keyExtractor={(item) => item.id}
          columns={[
            { header: 'Utilisateur', cell: (item) => <span className="text-slate-200">{item.user}</span> },
            { header: 'Action', cell: (item) => <span className="text-slate-300">{item.action}</span> },
            { header: 'Date', cell: (item) => <span className="text-slate-400">{new Date(item.date).toISOString().slice(0, 10)}</span> },
            { header: 'Détail', cell: (item) => <span className="text-slate-300">{item.detail}</span> },
          ]}
          emptyMessage="Aucune entrée ne correspond à la recherche."
        />
      </PrimeCard>
    </div>
  );
}

