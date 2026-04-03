import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { PrimeCard } from '../../components/PrimeCard';
import { RpPrimeService } from '../../services/rp-prime.service';
import { RpValidationItem } from '../../mock-data/rp';
import { useHierarchyDrill } from '../../contexts/HierarchyDrillContext';

interface Props {
  rpUserId: string;
}

export function RPFinalValidation({ rpUserId }: Props) {
  const [items, setItems] = useState<RpValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { drill } = useHierarchyDrill();

  const load = () => {
    setLoading(true);
    RpPrimeService.getManagerValidatedPrimes(rpUserId, drill).then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [rpUserId, drill.managerId, drill.coachId]);

  const onApprove = async (id: string) => {
    await RpPrimeService.updateRpValidationStatus(rpUserId, drill, id, 'RP Approved');
    load();
  };

  const onReject = async (id: string) => {
    await RpPrimeService.updateRpValidationStatus(rpUserId, drill, id, 'Rejected');
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Validation finale</h2>
        <p className="text-slate-400 mt-1">Primes deja validees par le manager, en attente de decision RP.</p>
      </div>

      <PrimeCard title="Validations manager">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="text-left py-3 text-slate-400 font-medium">Employe</th>
                <th className="text-left py-3 text-slate-400 font-medium">Projet</th>
                <th className="text-left py-3 text-slate-400 font-medium">Score performance</th>
                <th className="text-left py-3 text-slate-400 font-medium">Statut</th>
                <th className="text-right py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-default/60">
                  <td className="py-3 text-slate-200">{item.employeeName}</td>
                  <td className="py-3 text-slate-300">{item.projectName}</td>
                  <td className="py-3 text-cyan-300 font-semibold">{item.performanceScore}%</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'RP Approved'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : item.status === 'Rejected'
                          ? 'bg-rose-500/15 text-rose-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      {item.status === 'Manager Approved' && (
                        <>
                          <button
                            onClick={() => onApprove(item.id)}
                            className="p-2 rounded-md border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                            title="Approuver"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onReject(item.id)}
                            className="p-2 rounded-md border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                            title="Rejeter"
                          >
                            <X className="w-4 h-4" />
                          </button>
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

