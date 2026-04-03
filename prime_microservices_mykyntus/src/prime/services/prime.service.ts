import { Department, Employee, PrimeResult, PrimeRule, PrimeType, Role } from '../models';
import { mockDepartments, mockEmployees, mockPrimeResults, mockPrimeRules, mockPrimeTypes } from '../mock-data';
import { applyDrillDownToEmployeeRows, type HierarchyDrillSelection } from '../lib/hierarchyDrillDown';

/** Workflow : Pending → Coach → Manager → RP → RH (RH/Admin conservent une validation finale directe). */
export function getNextStatusAfterApproval(
  current: PrimeResult['status'],
  actorRole: Role,
): PrimeResult['status'] | null {
  if (actorRole === 'RH' || actorRole === 'Admin') {
    if (current === 'RH Approved' || current === 'Rejected') return null;
    return 'RH Approved';
  }
  if (actorRole === 'Coach') {
    return current === 'Pending' ? 'Coach Approved' : null;
  }
  if (actorRole === 'Manager') {
    return current === 'Coach Approved' ? 'Manager Approved' : null;
  }
  if (actorRole === 'RP') {
    return current === 'Manager Approved' ? 'RP Approved' : null;
  }
  return null;
}

// Simulating a service with promises (like RxJS Observables in Angular, but using Promises for React)

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const PrimeService = {
  getDepartments: async (): Promise<Department[]> => {
    await delay(300);
    return [...mockDepartments];
  },

  getEmployees: async (): Promise<Employee[]> => {
    await delay(300);
    return [...mockEmployees];
  },

  getPrimeTypes: async (): Promise<PrimeType[]> => {
    await delay(400);
    return [...mockPrimeTypes];
  },

  getPrimeRules: async (): Promise<PrimeRule[]> => {
    await delay(400);
    return [...mockPrimeRules];
  },

  getPrimeResults: async (): Promise<PrimeResult[]> => {
    await delay(500);
    return [...mockPrimeResults];
  },

  getPrimeResultsScoped: async (
    viewerRole: Role,
    viewerId: string,
    drill: HierarchyDrillSelection = {},
  ): Promise<PrimeResult[]> => {
    await delay(500);
    const employees = [...mockEmployees];
    const base = [...mockPrimeResults];
    return applyDrillDownToEmployeeRows(base, viewerRole, viewerId, employees, drill, mockDepartments);
  },

  getMyPrimeResults: async (employeeId: string): Promise<PrimeResult[]> => {
    await delay(450);
    return mockPrimeResults.filter((result) => result.employeeId === employeeId).map((result) => ({ ...result }));
  },

  updatePrimeResultStatus: async (id: string, status: PrimeResult['status'], approvedBy?: string): Promise<PrimeResult> => {
    await delay(300);
    const result = mockPrimeResults.find(r => r.id === id);
    if (!result) throw new Error('Result not found');
    result.status = status;
    if (approvedBy) result.approvedBy = approvedBy;
    return { ...result };
  },

  getDashboardStats: async () => {
    await delay(600);
    return {
      totalPrimesThisMonth: 1250,
      budgetConsumption: 75, // percentage
      topTeams: [
        { name: 'Team Alpha', amount: 4500 },
        { name: 'Team Gamma', amount: 3200 },
        { name: 'Team Beta', amount: 2800 },
      ],
      topEmployees: [
        { name: 'Alice Dupont', amount: 800 },
        { name: 'Diana Bernard', amount: 500 },
        { name: 'Bob Martin', amount: 450 },
      ],
      primeByDepartment: [
        { name: 'Operations', value: 8500 },
        { name: 'IT / Technical', value: 1200 },
        { name: 'HR', value: 400 },
      ],
      primeEvolution: [
        { month: 'Oct', amount: 7000 },
        { month: 'Nov', amount: 8200 },
        { month: 'Dec', amount: 9500 },
        { month: 'Jan', amount: 8800 },
        { month: 'Feb', amount: 9100 },
        { month: 'Mar', amount: 10100 },
      ]
    };
  }
};
