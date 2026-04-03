import { useEffect, useMemo, useState } from 'react';
import { PrimeCard } from '../../components/PrimeCard';
import { PrimeTable } from '../../components/PrimeTable';
import { AuditPrimeService, applyAuditHistoryFilters, formatAuditSteps } from '../../services/audit-prime.service';
import type { AuditOperation } from '../../mock-data/audit';

export function AuditHistory() {
  const [operations, setOperations] = useState<AuditOperation[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [project, setProject] = useState<string>('Tous');
  const [status, setStatus] = useState<'Tous' | 'Validé' | 'Rejeté' | 'En cours'>('Tous');

  useEffect(() => {
    setLoading(true);
    AuditPrimeService.getOperations()
      .then((ops) => setOperations(ops))
      .finally(() => setLoading(false));
  }, []);

  const projects = useMemo(() => {
    const set = new Set(operations.map((o) => o.projectName));
    return ['Tous', ...Array.from(set)];
  }, [operations]);

  const filtered = useMemo(() => {
    return applyAuditHistoryFilters(operations, {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      project: project === 'Tous' ? undefined : project,
      status: status,
    });
  }, [operations, dateFrom, dateTo, project, status]);

  if (loading) {
    return (
      <PrimeCard title="Historique global">
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        </div>
      </PrimeCard>
    );
  }

  return (
    <div className="space-y-6">
      <PrimeCard title="Historique global">
        <div className="space-y-4">
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400">Date (de)</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 w-full bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Date (à)</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 w-full bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Projet</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="mt-1 w-full bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              >
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-1 w-full bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Tous">Tous</option>
                <option value="Validé">Validé</option>
                <option value="Rejeté">Rejeté</option>
                <option value="En cours">En cours</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400">{filtered.length} résultats</div>
        </div>
      </PrimeCard>

      <PrimeCard title="Données auditées">
        <PrimeTable<AuditOperation>
          data={filtered}
          keyExtractor={(item) => item.id}
          columns={[
            { header: 'Employé', cell: (item) => <span className="text-slate-200">{item.employeeName}</span> },
            { header: 'Projet', cell: (item) => <span className="text-slate-300">{item.projectName}</span> },
            {
              header: 'Étapes de validation',
              cell: (item) => (
                <span className="text-slate-300">
                  {formatAuditSteps(item.steps)}
                </span>
              ),
            },
            { header: 'Validé par', cell: (item) => <span className="text-slate-200">{item.validatedBy}</span> },
            { header: 'Date', cell: (item) => <span className="text-slate-400">{item.date}</span> },
            {
              header: 'Statut',
              cell: (item) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'Validé'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : item.status === 'Rejeté'
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {item.status}
                </span>
              ),
            },
          ]}
          emptyMessage="Aucune operation ne correspond aux filtres."
        />
      </PrimeCard>
    </div>
  );
}

