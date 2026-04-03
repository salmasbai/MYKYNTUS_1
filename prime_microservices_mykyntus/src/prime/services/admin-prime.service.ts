import {
  AdminWorkflowConfig,
  mockAdminAlerts,
  mockAdminAnomalies,
  mockAdminAuditLogs,
  mockAdminCalculationConfig,
  mockAdminCharts,
  mockAdminRbacMatrix,
  mockAdminSystemKpis,
  mockAdminWorkflow,
  WORKFLOW_ACTIONS,
  WORKFLOW_STEP_ROLES,
} from '../mock-data/admin';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureRequiredWorkflowOrder(payload: AdminWorkflowConfig): AdminWorkflowConfig {
  const byRole = new Map(payload.steps.map((s) => [s.role, s]));
  const ensure = (role: 'Coach' | 'Manager' | 'RP' | 'RH', fallbackId: string) =>
    byRole.get(role) ?? {
      id: fallbackId,
      role,
      slaHours: role === 'RH' ? 48 : 24,
      actions: role === 'RH' ? ['Approve', 'Reject', 'Archive'] : ['Validate', 'Reject'],
      notificationType: 'email' as const,
      notificationEnabled: true,
    };
  return {
    ...payload,
    steps: [
      ensure('Coach', 'wf-coach'),
      ensure('Manager', 'wf-manager'),
      ensure('RP', 'wf-rp'),
      { ...ensure('RH', 'wf-rh-final'), role: 'RH' },
    ],
  };
}

export const AdminPrimeService = {
  getDashboard: async () => {
    await delay(220);
    return {
      kpis: { ...mockAdminSystemKpis },
      charts: {
        volumeByMonth: [...mockAdminCharts.volumeByMonth],
        validationRate: [...mockAdminCharts.validationRate],
        byDepartment: [...mockAdminCharts.byDepartment],
      },
      alerts: [...mockAdminAlerts],
    };
  },

  getCalculationConfig: async () => {
    await delay(180);
    return { ...mockAdminCalculationConfig, weights: { ...mockAdminCalculationConfig.weights }, parameters: { ...mockAdminCalculationConfig.parameters } };
  },

  saveCalculationConfig: async (payload: typeof mockAdminCalculationConfig) => {
    await delay(180);
    mockAdminCalculationConfig.formula = payload.formula;
    mockAdminCalculationConfig.weights = { ...payload.weights };
    mockAdminCalculationConfig.parameters = { ...payload.parameters };
    return { ...mockAdminCalculationConfig };
  },

  getRbacMatrix: async () => {
    await delay(180);
    return mockAdminRbacMatrix.map((row) => ({ ...row }));
  },

  toggleRbacPermission: async (role: string, permission: 'read' | 'edit' | 'validate' | 'configure') => {
    await delay(150);
    const row = mockAdminRbacMatrix.find((entry) => entry.role === role);
    if (!row) throw new Error('Role introuvable');
    row[permission] = !row[permission];
    return mockAdminRbacMatrix.map((entry) => ({ ...entry }));
  },

  getWorkflowConfig: async () => {
    await delay(150);
    const normalized = ensureRequiredWorkflowOrder(mockAdminWorkflow);
    mockAdminWorkflow.steps = normalized.steps;
    return {
      ...mockAdminWorkflow,
      steps: mockAdminWorkflow.steps.map((s) => ({ ...s, actions: [...s.actions] })),
      auditAccess: { ...mockAdminWorkflow.auditAccess },
    };
  },

  saveWorkflowConfig: async (payload: AdminWorkflowConfig) => {
    await delay(150);
    const allowedRoles = new Set<string>([...WORKFLOW_STEP_ROLES, 'RH']);
    const allowedActions = new Set<string>(WORKFLOW_ACTIONS);
    const sanitized = payload.steps
      .filter((s) => allowedRoles.has(s.role))
      .map((s, i) => ({
        ...s,
        id: s.id || `wf-step-${i + 1}`,
        slaHours: Number.isFinite(s.slaHours) && s.slaHours >= 0 ? s.slaHours : 24,
        actions: s.actions.filter((a) => allowedActions.has(a)),
      }));
    const normalized = ensureRequiredWorkflowOrder({ ...payload, steps: sanitized });
    mockAdminWorkflow.steps = normalized.steps;
    mockAdminWorkflow.auditAccess = {
      enabled: !!payload.auditAccess.enabled,
      readOnly: true,
      logs: !!payload.auditAccess.logs,
      history: !!payload.auditAccess.history,
      export: !!payload.auditAccess.export,
    };
    return {
      ...mockAdminWorkflow,
      steps: mockAdminWorkflow.steps.map((s) => ({ ...s, actions: [...s.actions] })),
      auditAccess: { ...mockAdminWorkflow.auditAccess },
    };
  },

  getAuditLogs: async () => {
    await delay(160);
    return mockAdminAuditLogs.map((row) => ({ ...row }));
  },

  getAnomalies: async () => {
    await delay(150);
    return mockAdminAnomalies.map((row) => ({ ...row }));
  },

  updateAnomalyStatus: async (id: string, status: 'Corrigee' | 'Ignoree') => {
    await delay(160);
    const row = mockAdminAnomalies.find((item) => item.id === id);
    if (!row) throw new Error('Anomalie introuvable');
    row.status = status;
    return mockAdminAnomalies.map((item) => ({ ...item }));
  },
};
