import { useEffect, useState } from 'react';
import { PrimeCard } from '../../components/PrimeCard';
import { AdminPrimeService } from '../../services/admin-prime.service';

export function AdminSupervisionLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    AdminPrimeService.getAuditLogs().then(setLogs);
  }, []);

  return (
    <div className="p-8 space-y-6 bg-navy-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Supervision & logs</h1>
        <p className="text-slate-400 mt-1">Historique des actions et audit trail technique.</p>
      </div>
      <PrimeCard title="Audit trail">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="text-left py-3 text-slate-400">Utilisateur</th>
                <th className="text-left py-3 text-slate-400">Action</th>
                <th className="text-left py-3 text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-default/60">
                  <td className="py-3 text-slate-200">{log.user}</td>
                  <td className="py-3 text-slate-300">{log.action}</td>
                  <td className="py-3 text-slate-400">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrimeCard>
    </div>
  );
}
