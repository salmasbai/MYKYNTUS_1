import { mockRpProjectAssignments, mockRpTeamPerformance, mockRpValidationItems, RpValidationItem } from '../mock-data/rp';
import { mockDepartments, mockEmployees } from '../mock-data';
import { piloteIdsForRpDrill, type HierarchyDrillSelection } from '../lib/hierarchyDrillDown';
import { intersectNullableEmployeeSets, orgAllowedEmployeeIds } from '../lib/organizationScope';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function combinedRpPiloteScope(rpUserId: string, drill: HierarchyDrillSelection): Set<string> | null {
  const piloteScope = piloteIdsForRpDrill(mockEmployees, rpUserId, drill);
  if (piloteScope === null) return null;
  const orgScope = orgAllowedEmployeeIds('RP', rpUserId, mockEmployees, mockDepartments);
  return intersectNullableEmployeeSets(piloteScope, orgScope) ?? new Set<string>();
}

export interface RpDashboardStats {
  projectProgress: number;
  completedTasks: number;
  averageTeamPerformance: number;
  pendingValidations: number;
  performanceEvolution: Array<{ month: string; score: number }>;
  memberPerformance: Array<{ name: string; score: number; status: 'Excellent' | 'Moyen' | 'Faible' }>;
}

export const RpPrimeService = {
  getAssignedProjectIds: async (rpUserId: string): Promise<string[]> => {
    await delay(150);
    return mockRpProjectAssignments[rpUserId] ?? ['proj-alpha'];
  },

  getRpDashboardStats: async (rpUserId: string, drill: HierarchyDrillSelection = {}): Promise<RpDashboardStats> => {
    const projectIds = await RpPrimeService.getAssignedProjectIds(rpUserId);
    await delay(250);

    const scope = combinedRpPiloteScope(rpUserId, drill);
    if (scope === null) {
      return {
        projectProgress: 0,
        completedTasks: 0,
        averageTeamPerformance: 0,
        pendingValidations: 0,
        performanceEvolution: [],
        memberPerformance: [],
      };
    }

    const projectTeamData = mockRpTeamPerformance
      .filter((item) => projectIds.includes(item.projectId))
      .filter((item) => scope.has(item.employeeId));
    const projectValidationData = mockRpValidationItems
      .filter((item) => projectIds.includes(item.projectId))
      .filter((item) => scope.has(item.employeeId));

    if (projectTeamData.length === 0) {
      return {
        projectProgress: 0,
        completedTasks: 0,
        averageTeamPerformance: 0,
        pendingValidations: projectValidationData.filter((item) => item.status === 'Manager Approved').length,
        performanceEvolution: [],
        memberPerformance: [],
      };
    }

    const totalCompletedTasks = projectTeamData.reduce((acc, member) => acc + member.completedTasks, 0);
    const totalTasks = projectTeamData.reduce((acc, member) => acc + member.totalTasks, 0);
    const avgTeamPerformance = projectTeamData.reduce((acc, member) => {
      const memberScore = Math.round((member.completedTasks / member.totalTasks) * 60 + (member.objectivesReached / member.totalObjectives) * 40);
      return acc + memberScore;
    }, 0) / Math.max(projectTeamData.length, 1);

    const performanceEvolution = projectTeamData[0]?.monthlyPerformance.map((point, index) => {
      const monthAverage = projectTeamData.reduce((acc, member) => acc + member.monthlyPerformance[index].score, 0) / projectTeamData.length;
      return { month: point.month, score: Math.round(monthAverage) };
    }) ?? [];

    const memberPerformance = projectTeamData.map((member) => {
      const score = Math.round((member.completedTasks / member.totalTasks) * 60 + (member.objectivesReached / member.totalObjectives) * 40);
      return {
        name: member.employeeName,
        score,
        status: score >= 85 ? 'Excellent' : score >= 70 ? 'Moyen' : 'Faible',
      };
    });

    return {
      projectProgress: Math.round((totalCompletedTasks / Math.max(totalTasks, 1)) * 100),
      completedTasks: totalCompletedTasks,
      averageTeamPerformance: Math.round(avgTeamPerformance),
      pendingValidations: projectValidationData.filter((item) => item.status === 'Manager Approved').length,
      performanceEvolution,
      memberPerformance,
    };
  },

  getTeamPerformanceByProject: async (rpUserId: string, drill: HierarchyDrillSelection = {}) => {
    const projectIds = await RpPrimeService.getAssignedProjectIds(rpUserId);
    await delay(220);
    const scope = combinedRpPiloteScope(rpUserId, drill);
    if (scope === null) return [];
    return mockRpTeamPerformance
      .filter((item) => projectIds.includes(item.projectId))
      .filter((item) => scope.has(item.employeeId));
  },

  getManagerValidatedPrimes: async (rpUserId: string, drill: HierarchyDrillSelection = {}): Promise<RpValidationItem[]> => {
    const projectIds = await RpPrimeService.getAssignedProjectIds(rpUserId);
    await delay(260);
    const scope = combinedRpPiloteScope(rpUserId, drill);
    if (scope === null) return [];
    return mockRpValidationItems
      .filter((item) => projectIds.includes(item.projectId))
      .filter((item) => scope.has(item.employeeId))
      .filter((item) => item.managerValidated)
      .map((item) => ({ ...item }));
  },

  updateRpValidationStatus: async (rpUserId: string, drill: HierarchyDrillSelection, id: string, status: 'RP Approved' | 'Rejected') => {
    await delay(200);
    const scope = combinedRpPiloteScope(rpUserId, drill);
    if (scope === null) throw new Error('Selection Manager/Coach requise');
    const item = mockRpValidationItems.find((entry) => entry.id === id);
    if (!item) {
      throw new Error('Validation introuvable');
    }
    if (!scope.has(item.employeeId) || !item.managerValidated) {
      throw new Error('Acces refuse hors perimetre hierarchique');
    }
    item.status = status;
    return { ...item };
  },
};
