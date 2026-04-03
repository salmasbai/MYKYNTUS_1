import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Wallet, CalendarClock, Clock3, Sparkles } from 'lucide-react';
import { PrimeCard } from '../../components/PrimeCard';
import { PrimeService } from '../../services/prime.service';
import { PrimeResult, PrimeType } from '../../models';
import { useRole } from '../../contexts/RoleContext';

export function EmployeeDashboard() {
  const { currentUser } = useRole();
  const [loading, setLoading] = useState(true);
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

  const currentMonth = '2026-03';
  const totalEarned = results.reduce((sum, item) => sum + item.amount, 0);
  const currentMonthEarned = results
    .filter((item) => item.period === currentMonth)
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = results.filter((item) => item.status === 'Pending').length;

  const monthlyData = useMemo(() => {
    const grouped = new Map<string, number>();
    results.forEach((item) => {
      grouped.set(item.period, (grouped.get(item.period) ?? 0) + item.amount);
    });
    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));
  }, [results]);

  const recentPrimes = [...results]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((result) => ({
      ...result,
      typeName: types.find((type) => type.id === result.primeTypeId)?.name ?? 'Unknown',
    }));

  if (loading) {
    return <div className="p-8 text-slate-400">Loading your dashboard...</div>;
  }

  return (
    <div className="p-8 space-y-6 bg-navy-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Welcome back, {currentUser.firstName}</h1>
        <p className="text-slate-400 mt-1">Your personal PRIME space - read-only and focused on your results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PrimeCard className="card-navy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total primes earned</p>
              <p className="text-2xl font-bold text-emerald-400">{totalEarned} MAD</p>
            </div>
            <Wallet className="w-5 h-5 text-emerald-300" />
          </div>
        </PrimeCard>
        <PrimeCard className="card-navy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Current month primes</p>
              <p className="text-2xl font-bold text-blue-300">{currentMonthEarned} MAD</p>
            </div>
            <CalendarClock className="w-5 h-5 text-blue-300" />
          </div>
        </PrimeCard>
        <PrimeCard className="card-navy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pending validations</p>
              <p className="text-2xl font-bold text-amber-300">{pendingCount}</p>
            </div>
            <Clock3 className="w-5 h-5 text-amber-300" />
          </div>
        </PrimeCard>
      </div>

      <PrimeCard title="Monthly earnings" description="Your prime evolution by month" className="card-navy">
        {monthlyData.length === 0 ? (
          <div className="text-slate-400 py-10 text-center">No primes yet</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="earningsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#60a5fa" fill="url(#earningsArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </PrimeCard>

      <PrimeCard title="Recent primes" className="card-navy">
        {recentPrimes.length === 0 ? (
          <div className="text-slate-400 py-8 text-center">No primes yet</div>
        ) : (
          <div className="space-y-3">
            {recentPrimes.map((prime) => (
              <div key={prime.id} className="bg-navy-900/70 border border-navy-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <div>
                    <p className="text-slate-200 font-medium">{prime.typeName}</p>
                    <p className="text-slate-400 text-xs">{prime.period}</p>
                  </div>
                </div>
                <div className="text-emerald-400 font-semibold">{prime.amount} MAD</div>
              </div>
            ))}
          </div>
        )}
      </PrimeCard>
    </div>
  );
}
