import { useEffect, useState } from 'react';
import { PrimeCard } from '../../components/PrimeCard';
import { AdminPrimeService } from '../../services/admin-prime.service';

export function AdminAnomalies() {
  const [rows, setRows] = useState<any[]>([]);

  const load = () => {
    AdminPrimeService.getAnomalies().then(setRows);
  };

  useEffect(() => {
    load();
  }, []);

  const correct = async (id: string) => {
    const updated = await AdminPrimeService.updateAnomalyStatus(id, 'Corrigee');
    setRows(updated);
  };

  const ignore = async (id: string) => {
    const updated = await AdminPrimeService.updateAnomalyStatus(id, 'Ignoree');
    setRows(updated);
  };

  return (
    <div className="p-8 space-y-6 bg-navy-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestion des anomalies</h1>
        <p className="text-slate-400 mt-1">Detection et traitement des erreurs de calcul et donnees manquantes.</p>
      </div>
      <PrimeCard title="Liste des anomalies">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="text-left py-3 text-slate-400">Type</th>
                <th className="text-left py-3 text-slate-400">Description</th>
                <th className="text-left py-3 text-slate-400">Statut</th>
                <th className="text-right py-3 text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-default/60">
                  <td className="py-3 text-slate-200">{row.type}</td>
                  <td className="py-3 text-slate-300">{row.description}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${row.status === 'Ouverte' ? 'bg-amber-500/20 text-amber-300' : row.status === 'Corrigee' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}`}>{row.status}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      {row.status === 'Ouverte' && (
                        <>
                          <button onClick={() => correct(row.id)} className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs">Corriger</button>
                          <button onClick={() => load()} className="px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 text-xs">Relancer calcul</button>
                          <button onClick={() => ignore(row.id)} className="px-3 py-1 rounded-md bg-slate-500/20 text-slate-300 text-xs">Ignorer</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrimeCard>
    </div>
  );
}
