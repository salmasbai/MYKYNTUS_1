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
  status: 'Manager Approved' | 'RP Approved' | 'Rejected';
  period: string;
}

export const mockRpProjectAssignments: Record<string, string[]> = {
  e6: ['proj-alpha'],
};

export const mockRpTeamPerformance: RpTeamMemberPerformance[] = [
  {
    employeeId: 'e1',
    employeeName: 'Alice Dupont',
    projectId: 'proj-alpha',
    projectName: 'Projet Alpha',
    completedTasks: 26,
    totalTasks: 30,
    objectivesReached: 4,
    totalObjectives: 5,
    monthlyPerformance: [
      { month: 'Oct', score: 78 },
      { month: 'Nov', score: 81 },
      { month: 'Dec', score: 84 },
      { month: 'Jan', score: 86 },
      { month: 'Feb', score: 88 },
      { month: 'Mar', score: 91 },
    ],
  },
  {
    employeeId: 'e2',
    employeeName: 'Bob Martin',
    projectId: 'proj-alpha',
    projectName: 'Projet Alpha',
    completedTasks: 20,
    totalTasks: 28,
    objectivesReached: 3,
    totalObjectives: 5,
    monthlyPerformance: [
      { month: 'Oct', score: 70 },
      { month: 'Nov', score: 72 },
      { month: 'Dec', score: 74 },
      { month: 'Jan', score: 76 },
      { month: 'Feb', score: 78 },
      { month: 'Mar', score: 80 },
    ],
  },
  {
    employeeId: 'e4',
    employeeName: 'Diana Bernard',
    projectId: 'proj-alpha',
    projectName: 'Projet Alpha',
    completedTasks: 28,
    totalTasks: 30,
    objectivesReached: 5,
    totalObjectives: 5,
    monthlyPerformance: [
      { month: 'Oct', score: 82 },
      { month: 'Nov', score: 85 },
      { month: 'Dec', score: 87 },
      { month: 'Jan', score: 89 },
      { month: 'Feb', score: 92 },
      { month: 'Mar', score: 94 },
    ],
  },
];

export const mockRpValidationItems: RpValidationItem[] = [
  {
    id: 'rpv1',
    employeeId: 'e1',
    employeeName: 'Alice Dupont',
    projectId: 'proj-alpha',
    projectName: 'Projet Alpha',
    performanceScore: 91,
    managerValidated: true,
    status: 'Manager Approved',
    period: '2026-03',
  },
  {
    id: 'rpv2',
    employeeId: 'e2',
    employeeName: 'Bob Martin',
    projectId: 'proj-alpha',
    projectName: 'Projet Alpha',
    performanceScore: 80,
    managerValidated: true,
    status: 'Manager Approved',
    period: '2026-03',
  },
];
