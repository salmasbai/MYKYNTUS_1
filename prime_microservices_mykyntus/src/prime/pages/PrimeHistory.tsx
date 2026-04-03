import { useEffect, useState } from 'react';
import { PrimeCard } from '../components/PrimeCard';
import { PrimeTable } from '../components/PrimeTable';
import { PrimeFilterBar } from '../components/PrimeFilterBar';
import { PrimeService } from '../services/prime.service';
import { PrimeResult, PrimeType, Employee } from '../models';
import { FileText, Download } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import { useHierarchyDrill } from '../contexts/HierarchyDrillContext';

export function PrimeHistory() {
  const { currentRole, currentUser } = useRole();
  const { drill } = useHierarchyDrill();
  const [results, setResults] = useState<PrimeResult[]>([]);
  const [types, setTypes] = useState<PrimeType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const resultsPromise =
      currentRole === 'Admin' || currentRole === 'RH' || currentRole === 'Audit'
        ? PrimeService.getPrimeResults()
        : PrimeService.getPrimeResultsScoped(currentRole, currentUser.id, drill);
    Promise.all([
      resultsPromise,
      PrimeService.getPrimeTypes(),
      PrimeService.getEmployees()
    ]).then(([resultsData, typesData, empData]) => {
      // Only show completed (approved/rejected) in history
      setResults(resultsData.filter(r => r.status === 'RH Approved' || r.status === 'Rejected'));
      setTypes(typesData);
      setEmployees(empData);
      setLoading(false);
    });
  }, [currentRole, currentUser.id, drill.managerId, drill.coachId]);

  const getEmployee = (id: string) => employees.find(e => e.id === id);
  const getType = (id: string) => types.find(t => t.id === id);

  const filteredResults = results.filter(r => {
    const emp = getEmployee(r.employeeId);
    const matchesSearch = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) : false;
    return matchesSearch;
  });

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-8 space-y-6 bg-app">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Prime History</h1>
          <p className="text-muted mt-1">Historical log of all processed bonuses.</p>
        </div>
        <button className="bg-card border border-default hover:bg-card/80 text-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export Log
        </button>
      </div>

      <PrimeFilterBar onSearch={setSearch} />

      <PrimeCard className="p-0">
        <PrimeTable<PrimeResult>
          data={filteredResults}
          keyExtractor={(item) => item.id}
          columns={[
            {
              header: 'Date Processed',
              cell: (item) => (
                <div className="text-sm text-muted flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted" />
                  {item.date}
                </div>
              )
            },
            {
              header: 'Employee',
              cell: (item) => {
                const emp = getEmployee(item.employeeId);
                return <div className="font-medium text-primary">{emp?.firstName} {emp?.lastName}</div>;
              }
            },
            {
              header: 'Prime Type',
              cell: (item) => <div className="text-sm text-primary">{getType(item.primeTypeId)?.name}</div>
            },
            {
              header: 'Amount',
              cell: (item) => <div className="font-semibold text-primary">{item.amount} MAD</div>
            },
            {
              header: 'Final Status',
              cell: (item) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'RH Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {item.status}
                </span>
              )
            },
            {
              header: 'Processed By',
              cell: (item) => {
                const approver = item.approvedBy ? getEmployee(item.approvedBy) : null;
                return <div className="text-sm text-muted">{approver ? `${approver.firstName} ${approver.lastName}` : 'System'}</div>;
              }
            }
          ]}
        />
      </PrimeCard>
    </div>
  );
}
