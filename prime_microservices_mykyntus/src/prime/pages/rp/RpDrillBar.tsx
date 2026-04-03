import { useHierarchyDrill } from '../../contexts/HierarchyDrillContext';
import { mockEmployees } from '../../mock-data';
import { drillSelectOptions } from '../../lib/hierarchyDrillDown';

interface Props {
  rpUserId: string;
}

/** Sélecteurs cascade Manager → Coach pour le périmètre RP (même logique que Prime). */
export function RpDrillBar({ rpUserId }: Props) {
  const { drill, setManagerId, setCoachId } = useHierarchyDrill();
  const { managers, coaches } = drillSelectOptions(mockEmployees, 'RP', rpUserId, drill);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={drill.managerId ?? ''}
        onChange={(e) => setManagerId(e.target.value || undefined)}
        className="text-sm pl-3 pr-8 py-2 rounded-lg border border-slate-600 bg-slate-900/80 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Manager</option>
        {managers.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={drill.coachId ?? ''}
        onChange={(e) => setCoachId(e.target.value || undefined)}
        disabled={!drill.managerId}
        className="text-sm pl-3 pr-8 py-2 rounded-lg border border-slate-600 bg-slate-900/80 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      >
        <option value="">Coach</option>
        {coaches.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
