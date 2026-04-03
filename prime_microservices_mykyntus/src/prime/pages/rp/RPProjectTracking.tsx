import { useEffect, useState } from 'react';
import { PrimeCard } from '../../components/PrimeCard';
import { RpPrimeService } from '../../services/rp-prime.service';
import { useHierarchyDrill } from '../../contexts/HierarchyDrillContext';

interface Props {
  rpUserId: string;
}

export function RPProjectTracking({ rpUserId }: Props) {
  const { drill } = useHierarchyDrill();
  const [projectData, setProjectData] = useState<
    Array<{ projectName: string; completedTasks: number; totalTasks: number }>
  >([]);

  useEffect(() => {
    RpPrimeService.getTeamPerformanceByProject(rpUserId, drill).then((rows) => {
      const grouped = rows.reduce<
        Record<string, { projectName: string; completedTasks: number; totalTasks: number }>
      >((acc, row) => {
        if (!acc[row.projectId]) {
          acc[row.projectId] = { projectName: row.projectName, completedTasks: 0, totalTasks: 0 };
        }
        acc[row.projectId].completedTasks += row.completedTasks;
        acc[row.projectId].totalTasks += row.totalTasks;
        return acc;
      }, {});
      setProjectData(Object.values(grouped));
    });
  }, [rpUserId, drill.managerId, drill.coachId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Suivi projet</h2>
        <p className="text-slate-400 mt-1">Etat d'avancement des projets affectes au RP.</p>
      </div>

      <PrimeCard title="Progression par projet">
        <div className="space-y-4">
          {projectData.map((project) => {
            const progress = Math.round(
              (project.completedTasks / Math.max(project.totalTasks, 1)) * 100,
            );
            return (
              <div
                key={project.projectName}
                className="p-4 rounded-xl bg-navy-900 border border-default"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-200 font-medium">{project.projectName}</span>
                  <span className="text-cyan-300 font-semibold">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {project.completedTasks} taches sur {project.totalTasks}
                </p>
              </div>
            );
          })}
        </div>
      </PrimeCard>
    </div>
  );
}

