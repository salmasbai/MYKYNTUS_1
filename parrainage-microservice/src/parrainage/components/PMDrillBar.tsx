import React from 'react';
import { useAuth } from '../../../frontend/app/hooks/useAuth';
import { useParrainageHierarchyDrill } from '@parrainage/shared/contexts/ParrainageHierarchyDrillContext';
import { ORG_NODES, listCoachesUnderManager, listManagersUnderRp } from '@parrainage/shared/utils/orgHierarchy';

const LABELS: Record<string, string> = {
  'rp-1': 'RP',
  'mgr-1': 'Manager',
  'coach-1': 'Coach',
};

export const PMDrillBar: React.FC = () => {
  const { user } = useAuth();
  const { drill, setManagerId, setCoachId } = useParrainageHierarchyDrill();
  const role = user?.role;

  if (role === 'MANAGER' && user) {
    const coaches = listCoachesUnderManager(ORG_NODES, user.id);
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-slate-500 uppercase">Périmètre</span>
        <select
          value={drill.coachId ?? ''}
          onChange={(e) => setCoachId(e.target.value || undefined)}
          className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200"
        >
          <option value="">Coach</option>
          {coaches.map((n) => (
            <option key={n.id} value={n.id}>
              {LABELS[n.id] ?? n.id}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (role === 'RP' && user) {
    const managers = listManagersUnderRp(ORG_NODES, user.id);
    const coaches = drill.managerId ? listCoachesUnderManager(ORG_NODES, drill.managerId) : [];
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-slate-500 uppercase">Périmètre</span>
        <select
          value={drill.managerId ?? ''}
          onChange={(e) => setManagerId(e.target.value || undefined)}
          className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200"
        >
          <option value="">Manager</option>
          {managers.map((n) => (
            <option key={n.id} value={n.id}>
              {LABELS[n.id] ?? n.id}
            </option>
          ))}
        </select>
        <select
          value={drill.coachId ?? ''}
          onChange={(e) => setCoachId(e.target.value || undefined)}
          disabled={!drill.managerId}
          className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 disabled:opacity-50"
        >
          <option value="">Coach</option>
          {coaches.map((n) => (
            <option key={n.id} value={n.id}>
              {LABELS[n.id] ?? n.id}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
};
