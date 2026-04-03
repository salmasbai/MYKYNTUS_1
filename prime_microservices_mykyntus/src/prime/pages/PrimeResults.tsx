import { useEffect, useState } from 'react';
import { PrimeCard } from '../components/PrimeCard';
import { PrimeTable } from '../components/PrimeTable';
import { PrimeFilterBar } from '../components/PrimeFilterBar';
import { PrimeService } from '../services/prime.service';
import { PrimeResult, PrimeType, Employee, Department } from '../models';
import { Download, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '../contexts/RoleContext';
import { useHierarchyDrill } from '../contexts/HierarchyDrillContext';
import { drillSelectOptions } from '../lib/hierarchyDrillDown';

export function PrimeResults() {
  const { currentRole, currentUser } = useRole();
  const { drill, setManagerId, setCoachId } = useHierarchyDrill();
  const [results, setResults] = useState<PrimeResult[]>([]);
  const [types, setTypes] = useState<PrimeType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('2026-03');

  useEffect(() => {
    setLoading(true);
    const resultsPromise =
      currentRole === 'Admin' || currentRole === 'RH' || currentRole === 'Audit'
        ? PrimeService.getPrimeResults()
        : PrimeService.getPrimeResultsScoped(currentRole, currentUser.id, drill);
    Promise.all([
      resultsPromise,
      PrimeService.getPrimeTypes(),
      PrimeService.getEmployees(),
      PrimeService.getDepartments(),
    ]).then(([resultsData, typesData, empData, deptsData]) => {
      setResults(resultsData);
      setTypes(typesData);
      setEmployees(empData);
      setDepartments(deptsData);
      setLoading(false);
    });
  }, [currentRole, currentUser.id, drill.managerId, drill.coachId]);

  const getEmployee = (id: string) => employees.find(e => e.id === id);
  const getType = (id: string) => types.find(t => t.id === id);

  const filteredResults = results.filter(r => {
    const emp = getEmployee(r.employeeId);
    const matchesSearch = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) : false;
    const matchesMonth = monthFilter ? r.period === monthFilter : true;
    return matchesSearch && matchesMonth;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'Coach Approved': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-50 text-cyan-800 border border-cyan-200"><CheckCircle2 className="w-3.5 h-3.5" /> Coach</span>;
      case 'Manager Approved': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 className="w-3.5 h-3.5" /> Mgr Appr.</span>;
      case 'RP Approved': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"><ShieldCheck className="w-3.5 h-3.5" /> RP Appr.</span>;
      case 'RH Approved': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> RH Appr.</span>;
      case 'Rejected': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default: return <span>{status}</span>;
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const drillOpts = drillSelectOptions(employees, currentRole, currentUser.id, drill);
  const filterBarFilters = [
    ...(currentRole === 'Manager'
      ? [
          {
            name: 'Coach',
            value: drill.coachId ?? '',
            onChange: (v: string) => setCoachId(v || undefined),
            options: drillOpts.coaches,
          },
        ]
      : []),
    ...(currentRole === 'RP'
      ? [
          {
            name: 'Manager',
            value: drill.managerId ?? '',
            onChange: (v: string) => setManagerId(v || undefined),
            options: drillOpts.managers,
          },
          {
            name: 'Coach',
            value: drill.coachId ?? '',
            onChange: (v: string) => setCoachId(v || undefined),
            options: drillOpts.coaches,
          },
        ]
      : []),
    {
      name: 'Month',
      value: monthFilter,
      onChange: setMonthFilter,
      options: [
        { label: 'March 2026', value: '2026-03' },
        { label: 'February 2026', value: '2026-02' },
        { label: 'January 2026', value: '2026-01' },
      ],
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Prime Results</h1>
          <p className="text-slate-500 mt-1">View calculated bonuses for employees.</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <PrimeFilterBar onSearch={setSearch} filters={filterBarFilters} />

      <PrimeCard className="p-0">
        <PrimeTable<PrimeResult>
          data={filteredResults}
          keyExtractor={(item) => item.id}
          columns={[
            {
              header: 'Employee',
              cell: (item) => {
                const emp = getEmployee(item.employeeId);
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {emp?.firstName.charAt(0)}{emp?.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{emp?.firstName} {emp?.lastName}</div>
                      <div className="text-xs text-slate-500">{emp?.email}</div>
                    </div>
                  </div>
                );
              }
            },
            {
              header: 'Prime Type',
              cell: (item) => (
                <div className="text-sm font-medium text-slate-700">
                  {getType(item.primeTypeId)?.name || 'Unknown'}
                </div>
              )
            },
            {
              header: 'Score / Target',
              cell: (item) => (
                <div className="text-sm text-slate-600">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.score}</span>
                </div>
              )
            },
            {
              header: 'Amount',
              cell: (item) => (
                <div className="font-semibold text-emerald-600">
                  {item.amount} MAD
                </div>
              )
            },
            {
              header: 'Status',
              cell: (item) => getStatusBadge(item.status)
            }
          ]}
        />
      </PrimeCard>
    </div>
  );
}
