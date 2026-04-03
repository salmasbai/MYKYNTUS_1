import { useEffect, useState } from 'react';
import { PrimeCard } from '../components/PrimeCard';
import { PrimeTable } from '../components/PrimeTable';
import { PrimeFilterBar } from '../components/PrimeFilterBar';
import { PrimeService, getNextStatusAfterApproval } from '../services/prime.service';
import { PrimeResult, PrimeType, Employee } from '../models';
import { Check, X, AlertCircle } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import { useHierarchyDrill } from '../contexts/HierarchyDrillContext';
import { drillSelectOptions } from '../lib/hierarchyDrillDown';
import { RPFinalValidation } from './rp/RPFinalValidation';

export function PrimeValidation() {
  const { currentRole, currentUser } = useRole();
  const { drill, setCoachId } = useHierarchyDrill();
  const [results, setResults] = useState<PrimeResult[]>([]);
  const [types, setTypes] = useState<PrimeType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');

  const fetchData = () => {
    setLoading(true);
    const resultsPromise =
      currentRole === 'Admin' || currentRole === 'RH' || currentRole === 'Audit'
        ? PrimeService.getPrimeResults()
        : PrimeService.getPrimeResultsScoped(currentRole, currentUser.id, drill);
    Promise.all([resultsPromise, PrimeService.getPrimeTypes(), PrimeService.getEmployees()]).then(
      ([resultsData, typesData, empData]) => {
        setResults(resultsData);
        setTypes(typesData);
        setEmployees(empData);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    fetchData();
  }, [currentRole, currentUser.id, drill.managerId, drill.coachId]);

  const getEmployee = (id: string) => employees.find(e => e.id === id);
  const getType = (id: string) => types.find(t => t.id === id);

  const filteredResults = results.filter(r => {
    return statusFilter ? r.status === statusFilter : true;
  });

  const handleApprove = async (id: string) => {
    try {
      const row = results.find((r) => r.id === id);
      if (!row) return;
      const next = getNextStatusAfterApproval(row.status, currentRole);
      if (!next) return;
      await PrimeService.updatePrimeResultStatus(id, next, currentUser.id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await PrimeService.updatePrimeResultStatus(id, 'Rejected', currentUser.id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const canApproveRow = (row: PrimeResult) => {
    if (currentRole === 'RH' || currentRole === 'Admin') {
      return row.status !== 'RH Approved' && row.status !== 'Rejected';
    }
    if (currentRole === 'Coach') return row.status === 'Pending';
    if (currentRole === 'Manager') return row.status === 'Coach Approved';
    return false;
  };

  if (currentRole === 'RP') {
    return <RPFinalValidation rpUserId={currentUser.id} />;
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const drillOpts = drillSelectOptions(employees, currentRole, currentUser.id, drill);
  const validationFilters = [
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
    {
      name: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'Pending', value: 'Pending' },
        { label: 'Coach Approved', value: 'Coach Approved' },
        { label: 'Manager Approved', value: 'Manager Approved' },
        { label: 'RP Approved', value: 'RP Approved' },
        { label: 'RH Approved', value: 'RH Approved' },
        { label: 'Rejected', value: 'Rejected' },
      ],
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Prime Validation</h1>
          <p className="text-slate-500 mt-1">Review and approve employee bonuses.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
            <Check className="w-4 h-4" />
            Approve All Pending
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-blue-900">Validation Workflow</h4>
          <p className="text-sm text-blue-700 mt-1">
            As an HR Manager, you are the final approver. Primes must be approved by the Manager and RP before reaching you, unless escalated.
          </p>
        </div>
      </div>

      <PrimeFilterBar filters={validationFilters} />

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
                  <div>
                    <div className="font-medium text-slate-900">{emp?.firstName} {emp?.lastName}</div>
                    <div className="text-xs text-slate-500">{emp?.role}</div>
                  </div>
                );
              }
            },
            {
              header: 'Prime Details',
              cell: (item) => (
                <div>
                  <div className="font-medium text-slate-700">{getType(item.primeTypeId)?.name}</div>
                  <div className="text-xs text-slate-500">Period: {item.period}</div>
                </div>
              )
            },
            {
              header: 'Amount',
              cell: (item) => (
                <div className="font-semibold text-slate-900">
                  {item.amount} MAD
                </div>
              )
            },
            {
              header: 'Current Status',
              cell: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {item.status}
                </span>
              )
            },
            {
              header: 'Actions',
              className: 'text-right',
              cell: (item) => (
                <div className="flex items-center justify-end gap-2">
                  {canApproveRow(item) && (
                    <>
                      <button 
                        onClick={() => handleApprove(item.id)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors border border-transparent hover:border-emerald-200" 
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleReject(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-transparent hover:border-rose-200" 
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )
            }
          ]}
        />
      </PrimeCard>
    </div>
  );
}
