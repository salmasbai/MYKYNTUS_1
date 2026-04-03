import { useEffect, useState } from 'react';
import { PrimeCard } from '../../components/PrimeCard';
import { RpPrimeService } from '../../services/rp-prime.service';
import { useHierarchyDrill } from '../../contexts/HierarchyDrillContext';

interface Props {
  rpUserId: string;
}

export function RPTeamPerformance({ rpUserId }: Props) {
  const { drill } = useHierarchyDrill();
  const [rows, setRows] = useState<
    Array<{
      employeeId: string;
      employeeName: string;
      projectName: string;
      completedTasks: number;
      totalTasks: number;
      objectivesReached: number;
      totalObjectives: number;
    }>
  >([]);

  useEffect(() => {
    RpPrimeService.getTeamPerformanceByProject(rpUserId, drill).then((data) => {
      setRows(data);
    });
  }, [rpUserId, drill.managerId, drill.coachId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Performance équipe</h2>
        <p className="text-slate-400 mt-1">Suivi detaille des taches et objectifs par membre.</p>
      </div>

      <PrimeCard title="Membres du projet">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="text-left py-3 text-slate-400 font-medium">Nom</th>
                <th className="text-left py-3 text-slate-400 font-medium">Projet</th>
                <th className="text-left py-3 text-slate-400 font-medium">Taches completees</th>
                <th className="text-left py-3 text-slate-400 font-medium">Objectifs atteints</th>
                <th className="text-left py-3 text-slate-400 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const score = Math.round(
                  (row.completedTasks / row.totalTasks) * 60 +
                    (row.objectivesReached / row.totalObjectives) * 40,
                );
                return (
                  <tr key={`${row.employeeId}-${row.projectName}`} className="border-b border-default/60">
                    <td className="py-3 text-slate-200">{row.employeeName}</td>
                    <td className="py-3 text-slate-300">{row.projectName}</td>
                    <td className="py-3 text-slate-200">
                      {row.completedTasks}/{row.totalTasks}
                    </td>
                    <td className="py-3 text-slate-200">
                      {row.objectivesReached}/{row.totalObjectives}
                    </td>
                    <td className="py-3 font-semibold text-cyan-300">{score}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PrimeCard>
    </div>
  );
}

