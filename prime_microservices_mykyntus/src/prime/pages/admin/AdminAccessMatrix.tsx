import { useEffect, useState } from 'react';
import { PrimeCard } from '../../components/PrimeCard';
import { AdminPrimeService } from '../../services/admin-prime.service';

export function AdminAccessMatrix() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    AdminPrimeService.getRbacMatrix().then(setRows);
  }, []);

  const toggle = async (role: string, permission: 'read' | 'edit' | 'validate' | 'configure') => {
    const updated = await AdminPrimeService.toggleRbacPermission(role, permission);
    setRows(updated);
  };

  return (
    <div className="p-8 space-y-6 bg-navy-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestion des acces</h1>
        <p className="text-slate-400 mt-1">Matrice RBAC des roles et permissions PRIME.</p>
      </div>
      <PrimeCard title="Matrice RBAC">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="text-left py-3 text-slate-400">Role</th>
                <th className="text-left py-3 text-slate-400">Lire</th>
                <th className="text-left py-3 text-slate-400">Modifier</th>
                <th className="text-left py-3 text-slate-400">Valider</th>
                <th className="text-left py-3 text-slate-400">Configurer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.role} className="border-b border-default/60">
                  <td className="py-3 text-slate-200">{row.role}</td>
                  {(['read', 'edit', 'validate', 'configure'] as const).map((permission) => (
                    <td key={permission} className="py-3">
                      <button onClick={() => toggle(row.role, permission)} className={`px-3 py-1 rounded-md text-xs ${row[permission] ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {row[permission] ? 'Oui' : 'Non'}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrimeCard>
    </div>
  );
}
