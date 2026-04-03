import React from 'react';
import type { Role } from '../types';
import { demoUserIdForRole, drillSelectOptions } from '../lib/documentationOrgHierarchy';
import { useDocumentationHierarchyDrill } from '../contexts/DocumentationHierarchyDrillContext';

/** Filtres cascade Manager → Coach → Pilotes (RP : Manager puis Coach). */
export const DocDrillBar: React.FC<{ role: Role }> = ({ role }) => {
  const { drill, setManagerId, setCoachId } = useDocumentationHierarchyDrill();
  const viewerId = demoUserIdForRole(role);
  const { managers, coaches } = drillSelectOptions(role, viewerId, drill);

  if (role === 'Manager') {
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-slate-500 uppercase tracking-wide">Périmètre</span>
        <select
          value={drill.coachId ?? ''}
          onChange={(e) => setCoachId(e.target.value || undefined)}
          className="bg-navy-900 border border-navy-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
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

  if (role === 'RP') {
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-slate-500 uppercase tracking-wide">Périmètre</span>
        <select
          value={drill.managerId ?? ''}
          onChange={(e) => setManagerId(e.target.value || undefined)}
          className="bg-navy-900 border border-navy-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
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
          className="bg-navy-900 border border-navy-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
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

  return null;
};
