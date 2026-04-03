import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, CircleX, Wallet } from 'lucide-react';
import { PrimeCard } from '../../components/PrimeCard';
import { PrimeFilterBar } from '../../components/PrimeFilterBar';
import { PrimeTable } from '../../components/PrimeTable';
import { useRole } from '../../contexts/RoleContext';
import { PrimeResult, PrimeType } from '../../models';
import { PrimeService } from '../../services/prime.service';

function getStatusBadge(status: PrimeResult['status']) {
  const normalized = status === 'Rejected' ? 'Rejected' : status === 'Pending' ? 'Pending' : 'Approved';
  if (normalized === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </span>
    );
  }
  if (normalized === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock3 className="w-3.5 h-3.5" /> Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
      <CircleX className="w-3.5 h-3.5" /> Rejected
    </span>
  );
}

export function MyPrimes() {
  const { currentUser } = useRole();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [results, setResults] = useState<PrimeResult[]>([]);
  const [types, setTypes] = useState<PrimeType[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([PrimeService.getMyPrimeResults(currentUser.id), PrimeService.getPrimeTypes()]).then(
      ([myResults, primeTypes]) => {
        setResults(myResults);
        setTypes(primeTypes);
        setLoading(false);
      },
    );
  }, [currentUser.id]);

  const periods = useMemo(() => [...new Set(results.map((result) => result.period))].sort(), [results]);

  const filtered = results.filter((result) => {
    const normalized = result.status === 'Rejected' ? 'Rejected' : result.status === 'Pending' ? 'Pending' : 'Approved';
    const statusMatch = statusFilter ? normalized === statusFilter : true;
    const periodMatch = periodFilter ? result.period === periodFilter : true;
    return statusMatch && periodMatch;
  });

  if (loading) {
    return <div className="p-8 text-slate-400">Loading your primes...</div>;
  }

  return (
    <div className="p-8 space-y-6 bg-navy-950 min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">My Primes</h1>
          <p className="text-slate-400 mt-1">Only your prime history is visible in this page.</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-navy-900/80 border border-navy-800 rounded-lg px-3 py-2 text-slate-300 text-sm">
          <Wallet className="w-4 h-4 text-blue-300" />
          <span>{currentUser.firstName} {currentUser.lastName}</span>
        </div>
      </div>

      <PrimeFilterBar
        filters={[
          {
            name: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Approved', value: 'Approved' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Rejected', value: 'Rejected' },
            ],
          },
          {
            name: 'Period',
            value: periodFilter,
            onChange: setPeriodFilter,
            options: periods.map((period) => ({ label: period, value: period })),
          },
        ]}
      />

      <PrimeCard className="p-0 card-navy">
        <PrimeTable<PrimeResult>
          data={filtered}
          keyExtractor={(item) => item.id}
          emptyMessage="No primes yet"
          columns={[
            {
              header: 'Prime Type',
              cell: (item) => <span className="font-medium text-slate-200">{types.find((type) => type.id === item.primeTypeId)?.name ?? 'Unknown'}</span>,
            },
            { header: 'Period', accessorKey: 'period' },
            { header: 'Score', accessorKey: 'score' },
            {
              header: 'Amount',
              cell: (item) => <span className="font-semibold text-emerald-400">{item.amount} MAD</span>,
            },
            {
              header: 'Status',
              cell: (item) => getStatusBadge(item.status),
            },
          ]}
        />
      </PrimeCard>
    </div>
  );
}
