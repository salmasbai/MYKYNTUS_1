import { useEffect, useState } from 'react';
import { PrimeCard } from '../components/PrimeCard';
import { PrimeTable } from '../components/PrimeTable';
import { PrimeFilterBar } from '../components/PrimeFilterBar';
import { PrimeService } from '../services/prime.service';
import { PrimeResult, Employee, PrimeType } from '../models';
import { TrendingUp, Users, Award } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import { useHierarchyDrill } from '../contexts/HierarchyDrillContext';
import { drillSelectOptions } from '../lib/hierarchyDrillDown';

export function TeamPerformance() {
  const { currentRole, currentUser } = useRole();
  const { drill, setCoachId } = useHierarchyDrill();
  const [results, setResults] = useState<PrimeResult[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [types, setTypes] = useState<PrimeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      PrimeService.getPrimeResultsScoped(currentRole, currentUser.id, drill),
      PrimeService.getEmployees(),
      PrimeService.getPrimeTypes(),
    ]).then(([resultsData, empData, typesData]) => {
      setAllEmployees(empData);
      const teamEmployees = empData.filter((e) => resultsData.some((r) => r.employeeId === e.id));
      setEmployees(teamEmployees);
      setResults(resultsData);
      setTypes(typesData);
      setLoading(false);
    });
  }, [currentRole, currentUser.id, drill.coachId]);

  const getEmployee = (id: string) => employees.find(e => e.id === id);
  const getType = (id: string) => types.find(t => t.id === id);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const totalPrimes = results.reduce((acc, curr) => acc + curr.amount, 0);
  const drillOpts = drillSelectOptions(allEmployees, currentRole, currentUser.id, drill);
  const teamPerfFilters =
    currentRole === 'Manager'
      ? [
          {
            name: 'Coach',
            value: drill.coachId ?? '',
            onChange: (v: string) => setCoachId(v || undefined),
            options: drillOpts.coaches,
          },
        ]
      : [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Performance</h1>
          <p className="text-slate-500 mt-1">Overview of your team's metrics and bonuses.</p>
        </div>
      </div>

      {teamPerfFilters.length > 0 && <PrimeFilterBar filters={teamPerfFilters} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Team Members</p>
            <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Bonuses</p>
            <p className="text-2xl font-bold text-slate-900">{totalPrimes} MAD</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Performance</p>
            <p className="text-2xl font-bold text-slate-900">92%</p>
          </div>
        </div>
      </div>

      <PrimeCard title="Team Members & Bonuses" className="p-0">
        <PrimeTable<PrimeResult>
          data={results}
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
                    <div className="font-medium text-slate-900">{emp?.firstName} {emp?.lastName}</div>
                  </div>
                );
              }
            },
            {
              header: 'Bonus Type',
              cell: (item) => <div className="text-sm text-slate-700">{getType(item.primeTypeId)?.name}</div>
            },
            {
              header: 'Score',
              cell: (item) => <div className="font-mono text-sm text-slate-600">{item.score}</div>
            },
            {
              header: 'Amount',
              cell: (item) => <div className="font-semibold text-emerald-600">{item.amount} MAD</div>
            },
            {
              header: 'Status',
              cell: (item) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {item.status}
                </span>
              )
            }
          ]}
        />
      </PrimeCard>
    </div>
  );
}
