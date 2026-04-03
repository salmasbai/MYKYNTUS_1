// Prime (base) + RP + Admin + Audit models.
// Keep camelCase property names to match backend JSON serialization.

export interface Department {
  id: string;
  name: string;
  poles: Pole[];
}

export interface Pole {
  id: string;
  name: string;
  departmentId: string;
  cells: Cellule[];
}

export interface Cellule {
  id: string;
  name: string;
  poleId: string;
  teams: Team[];
}

export interface Team {
  id: string;
  name: string;
  celluleId: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  teamId: string;
  email: string;
  avatar?: string;
  /** Périmètre organisationnel (Département → Pôle → Cellule). */
  departementId?: string;
  poleId?: string;
  celluleId?: string;
}

export interface PrimeType {
  id: string;
  name: string;
  type: string;
  departmentId: string;
  status: string;
  description?: string;
}

export interface PrimeRule {
  id: string;
  primeTypeId: string;
  departmentId?: string;
  poleId?: string;
  celluleId?: string;
  teamId?: string;
  roleId?: string;
  conditionField: string;
  conditionType: string;
  targetValue: number;
  calculationMethod: string;
  amount: number;
  period: string;
}

export interface PrimeResult {
  id: string;
  employeeId: string;
  primeTypeId: string;
  score: number;
  amount: number;
  status: string;
  period: string;
  approvedBy?: string;
  date: string;
}

export interface PrimeDashboardStats {
  totalPrimesThisMonth: number;
  budgetConsumption: number;
  topTeams: Array<{ name: string; amount: number }>;
  topEmployees: Array<{ name: string; amount: number }>;
  primeByDepartment: Array<{ name: string; value: number }>;
  primeEvolution: Array<{ month: string; amount: number }>;
}

// -----------------------------
// RP
// -----------------------------

export interface RpTeamMemberPerformance {
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  completedTasks: number;
  totalTasks: number;
  objectivesReached: number;
  totalObjectives: number;
  monthlyPerformance: Array<{ month: string; score: number }>;
}

export interface RpValidationItem {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  performanceScore: number;
  managerValidated: boolean;
  status: string;
  period: string;
}

export interface RpDashboardStats {
  projectProgress: number;
  completedTasks: number;
  averageTeamPerformance: number;
  pendingValidations: number;
  performanceEvolution: Array<{ month: string; score: number }>;
  memberPerformance: Array<{ name: string; score: number; status: string }>;
}

// -----------------------------
// Admin
// -----------------------------

export interface AdminSystemKpi {
  totalGeneratedPrimes: number;
  validationsInProgress: number;
  errorCount: number;
  avgProcessingTimeSec: number;
}

export interface AdminSystemAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  date: string;
}

export interface AdminCalculationConfig {
  formula: string;
  weights: {
    individualPerformance: number;
    teamPerformance: number;
    objectives: number;
  };
  parameters: {
    cap: number;
    minThreshold: number;
    bonus: number;
  };
}

export interface AdminAuditLog {
  id: string;
  user: string;
  action: string;
  date: string;
}

export interface AdminAnomaly {
  id: string;
  type: string;
  description: string;
  status: string;
}

export interface AdminChartPoint {
  month: string;
  value: number;
}

export interface AdminByDepartmentPoint {
  name: string;
  value: number;
}

export interface AdminDashboardCharts {
  volumeByMonth: AdminChartPoint[];
  validationRate: AdminChartPoint[];
  byDepartment: AdminByDepartmentPoint[];
}

export interface AdminDashboardResponse {
  kpis: AdminSystemKpi;
  charts: AdminDashboardCharts;
  alerts: AdminSystemAlert[];
}

export interface AdminWorkflowConfig {
  steps: string[];
  slaHours: number;
  notificationsEnabled: boolean;
}

export interface AdminRbacRow {
  role: string;
  read: boolean;
  edit: boolean;
  validate: boolean;
  configure: boolean;
}

// -----------------------------
// Audit
// -----------------------------

export interface AuditValidationStep {
  role: string;
  status: string;
  date: string;
}

export interface AuditOperation {
  id: string;
  employeeName: string;
  projectName: string;
  steps: AuditValidationStep[];
  validatedBy: string;
  date: string;
  status: string;
}

export interface AuditTrailLog {
  id: string;
  user: string;
  action: string;
  date: string;
  detail: string;
}

export interface AuditAnomaly {
  id: string;
  type: string;
  description: string;
  validationId?: string;
  status: string;
}

export interface AuditKpis {
  totalPrimes: number;
  validations: number;
  anomalies: number;
  conformityRate: number;
}

export interface AuditFlowByStepPoint {
  step: string;
  value: number;
}

export interface AuditNamedPoint {
  name: string;
  value: number;
}

export interface AuditActivityByRolePoint {
  role: string;
  value: number;
}

export interface AuditDashboardCharts {
  flowByStep: AuditFlowByStepPoint[];
  validationVsRejection: AuditNamedPoint[];
  activityByRole: AuditActivityByRolePoint[];
}

export interface AuditDashboardResponse {
  kpis: AuditKpis;
  charts: AuditDashboardCharts;
}

