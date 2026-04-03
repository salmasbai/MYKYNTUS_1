import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDown, ArrowUp, Gauge } from 'lucide-react';
import { PrimeCard } from '../../components/PrimeCard';
import { PrimeResult } from '../../models';
import { PrimeService } from '../../services/prime.service';
import { useRole } from '../../contexts/RoleContext';

export function MyPerformance() {
  const { currentUser } = useRole();
  const [loading, setLoading] = useState(true);
  const [myResults, setMyResults] = useState<PrimeResult[]>([]);
  const [allResults, setAllResults] = useState<PrimeResult[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([PrimeService.getMyPrimeResults(currentUser.id), PrimeService.getPrimeResultsScoped('Pilote', currentUser.id)]).then(
      ([mine, all]) => {
        setMyResults(mine);
        setAllResults(all);
        setLoading(false);
      },
    );
  }, [currentUser.id]);

  const chartData = useMemo(() => {
    const monthMap = new Map<string, { mineScores: number[]; teamScores: number[] }>();
    myResults.forEach((result) => {
      const month = result.period;
      const sameMonthTeam = allResults.filter((item) => item.period === month && item.employeeId !== currentUser.id);
      const current = monthMap.get(month) ?? { mineScores: [], teamScores: [] };
      current.mineScores.push(result.score);
      sameMonthTeam.forEach((teamResult) => current.teamScores.push(teamResult.score));
      monthMap.set(month, current);
    });

    return [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => {
        const myAvg = values.mineScores.length ? values.mineScores.reduce((sum, score) => sum + score, 0) / values.mineScores.length : 0;
        const teamAvg = values.teamScores.length ? values.teamScores.reduce((sum, score) => sum + score, 0) / values.teamScores.length : 0;
        return {
          month,
          myScore: Number(myAvg.toFixed(1)),
          teamAverage: Number(teamAvg.toFixed(1)),
        };
      });
  }, [allResults, currentUser.id, myResults]);

  const averageScore = chartData.length
    ? Number((chartData.reduce((sum, item) => sum + item.myScore, 0) / chartData.length).toFixed(1))
    : 0;
  const bestMonth = [...chartData].sort((a, b) => b.myScore - a.myScore)[0];
  const worstMonth = [...chartData].sort((a, b) => a.myScore - b.myScore)[0];

  if (loading) {
    return <div className="p-8 text-slate-400">Loading your performance...</div>;
  }

  return (
    <div className="p-8 space-y-6 bg-navy-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">My Performance</h1>
        <p className="text-slate-400 mt-1">Track your score evolution and compare with team average.</p>
      </div>

      <PrimeCard title="Score evolution" description="My score vs team average" className="card-navy">
        {chartData.length === 0 ? (
          <div className="text-slate-400 py-10 text-center">No primes yet</div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="myScore" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="teamAverage" stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </PrimeCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PrimeCard className="card-navy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Average score</p>
              <p className="text-2xl font-bold text-blue-300">{averageScore}</p>
            </div>
            <Gauge className="w-5 h-5 text-blue-300" />
          </div>
        </PrimeCard>
        <PrimeCard className="card-navy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Best month</p>
              <p className="text-lg font-semibold text-emerald-400">{bestMonth ? `${bestMonth.month} (${bestMonth.myScore})` : '-'}</p>
            </div>
            <ArrowUp className="w-5 h-5 text-emerald-400" />
          </div>
        </PrimeCard>
        <PrimeCard className="card-navy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Worst month</p>
              <p className="text-lg font-semibold text-rose-400">{worstMonth ? `${worstMonth.month} (${worstMonth.myScore})` : '-'}</p>
            </div>
            <ArrowDown className="w-5 h-5 text-rose-400" />
          </div>
        </PrimeCard>
      </div>
    </div>
  );
}
