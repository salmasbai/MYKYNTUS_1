import { mockAuditCharts, mockAuditKpis, mockAuditAnomalies, mockAuditOperations, mockAuditTrailLogs } from '../mock-data/audit';
import type { AuditAnomaly, AuditOperation, AuditTrailLog } from '../mock-data/audit';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type AuditHistoryFilter = {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  project?: string;
  status?: 'Validé' | 'Rejeté' | 'En cours' | 'Tous';
};

export const AuditPrimeService = {
  getDashboard: async () => {
    await delay(220);
    return {
      kpis: { ...mockAuditKpis },
      charts: {
        flowByStep: [...mockAuditCharts.flowByStep],
        validationVsRejection: [...mockAuditCharts.validationVsRejection],
        activityByRole: [...mockAuditCharts.activityByRole],
      },
    };
  },

  getOperations: async () => {
    await delay(240);
    return mockAuditOperations.map((op) => ({ ...op, steps: op.steps.map((s) => ({ ...s })) }));
  },

  getAuditTrailLogs: async () => {
    await delay(200);
    return mockAuditTrailLogs.map((log) => ({ ...log }));
  },

  getAnomalies: async () => {
    await delay(200);
    return mockAuditAnomalies.map((a) => ({ ...a }));
  },
};

export function applyAuditHistoryFilters(ops: AuditOperation[], filter: AuditHistoryFilter) {
  const { dateFrom, dateTo, project, status } = filter;
  return ops.filter((op) => {
    const matchesProject = project ? op.projectName === project : true;
    const matchesStatus = status && status !== 'Tous' ? op.status === status : true;
    const matchesFrom = dateFrom ? op.date >= dateFrom : true;
    const matchesTo = dateTo ? op.date <= dateTo : true;
    return matchesProject && matchesStatus && matchesFrom && matchesTo;
  });
}

export function formatAuditSteps(steps: AuditOperation['steps']) {
  return steps.map((s) => `${s.role}: ${s.status}`).join(' • ');
}

export type { AuditOperation, AuditTrailLog, AuditAnomaly };

