import { useEffect, useState } from 'react';
import { PrimeCard } from '../components/PrimeCard';
import { PrimeTable } from '../components/PrimeTable';
import { PrimeFilterBar } from '../components/PrimeFilterBar';
import { PrimeModal } from '../components/PrimeModal';
import { PrimeRuleBuilder } from '../components/PrimeRuleBuilder';
import { PrimeService } from '../services/prime.service';
import { PrimeRule, PrimeType, Department } from '../models';
import { Plus, Edit2, Trash2, Settings2 } from 'lucide-react';

export function PrimeRules() {
  const [rules, setRules] = useState<PrimeRule[]>([]);
  const [types, setTypes] = useState<PrimeType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      PrimeService.getPrimeRules(),
      PrimeService.getPrimeTypes(),
      PrimeService.getDepartments()
    ]).then(([rulesData, typesData, deptsData]) => {
      setRules(rulesData);
      setTypes(typesData);
      setDepartments(deptsData);
      setLoading(false);
    });
  }, []);

  const filteredRules = rules.filter(r => {
    return typeFilter ? r.primeTypeId === typeFilter : true;
  });

  const getTypeName = (id: string) => types.find(t => t.id === id)?.name || 'Unknown';
  const getDeptName = (id?: string) => departments.find(d => d.id === id)?.name || 'All';

  const handleSaveRule = (rule: any) => {
    setIsModalOpen(false);
    // In a real app, this would call PrimeService.addPrimeRule
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-8 space-y-6 bg-app">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Prime Rules</h1>
          <p className="text-muted mt-1">Configure logic and conditions for bonuses.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      <PrimeFilterBar 
        filters={[
          {
            name: 'Prime Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: types.map(t => ({ label: t.name, value: t.id }))
          }
        ]}
      />

      <PrimeCard className="p-0">
        <PrimeTable<PrimeRule>
          data={filteredRules}
          keyExtractor={(item) => item.id}
          columns={[
            {
              header: 'Prime Type',
              cell: (item) => (
                <div className="font-medium text-primary flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-500" />
                  {getTypeName(item.primeTypeId)}
                </div>
              )
            },
            {
              header: 'Scope',
              cell: (item) => (
                <div className="text-sm">
                  <span className="text-muted">Dept:</span> {getDeptName(item.departmentId)}
                </div>
              )
            },
            {
              header: 'Condition',
              cell: (item) => (
                <div className="font-mono text-xs bg-card px-2 py-1 rounded text-primary inline-block border border-default">
                  IF {item.conditionField} {item.conditionType} {item.targetValue}
                </div>
              )
            },
            {
              header: 'Reward',
              cell: (item) => (
                <div className="font-medium text-emerald-500">
                  {item.amount} {item.calculationMethod === 'Percentage' ? '%' : 'MAD'}
                </div>
              )
            },
            {
              header: 'Period',
              accessorKey: 'period'
            },
            {
              header: 'Actions',
              className: 'text-right',
              cell: () => (
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            }
          ]}
        />
      </PrimeCard>

      <PrimeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Build Prime Rule"
        className="max-w-2xl"
      >
        <PrimeRuleBuilder 
          types={types} 
          departments={departments} 
          onSave={handleSaveRule} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </PrimeModal>
    </div>
  );
}
