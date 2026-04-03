import { Department, Employee, PrimeResult, PrimeRule, PrimeType } from '../models';

export const mockDepartments: Department[] = [
  {
    id: 'd1',
    name: 'Operations',
    poles: [
      {
        id: 'p1',
        name: 'Pôle Client',
        departmentId: 'd1',
        cells: [
          {
            id: 'c1',
            name: 'Support Client',
            poleId: 'p1',
            teams: [
              { id: 't1', name: 'Team Alpha', celluleId: 'c1' },
              { id: 't2', name: 'Team Beta', celluleId: 'c1' },
            ],
          },
          {
            id: 'c2',
            name: 'Satisfaction Client',
            poleId: 'p1',
            teams: [
              { id: 't3', name: 'Team Gamma', celluleId: 'c2' },
            ],
          },
        ],
      },
      {
        id: 'p2',
        name: 'Pôle Escalade',
        departmentId: 'd1',
        cells: [
          {
            id: 'c3',
            name: 'Gestion de retards',
            poleId: 'p2',
            teams: [
              { id: 't4', name: 'Team Delta', celluleId: 'c3' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'd2',
    name: 'IT / Technical',
    poles: [
      {
        id: 'p3',
        name: 'Infrastructure',
        departmentId: 'd2',
        cells: [
          {
            id: 'c4',
            name: 'Network',
            poleId: 'p3',
            teams: [
              { id: 't5', name: 'NetOps', celluleId: 'c4' },
            ],
          },
        ],
      },
    ],
  },
];

/** Chaîne : e6 RP → e3 Manager → e8 Coach → pilotes e1,e2,e4 */
export const mockEmployees: Employee[] = [
  { id: 'e1', firstName: 'Alice', lastName: 'Dupont', role: 'Pilote', parentId: 'e8', teamId: 't1', departementId: 'd1', poleId: 'p1', celluleId: 'c1', email: 'alice.dupont@mykyntus.com' },
  { id: 'e2', firstName: 'Bob', lastName: 'Martin', role: 'Pilote', parentId: 'e8', teamId: 't1', departementId: 'd1', poleId: 'p1', celluleId: 'c1', email: 'bob.martin@mykyntus.com' },
  { id: 'e3', firstName: 'Charlie', lastName: 'Durand', role: 'Manager', parentId: 'e6', teamId: 't1', departementId: 'd1', poleId: 'p1', celluleId: 'c1', email: 'charlie.durand@mykyntus.com' },
  { id: 'e4', firstName: 'Diana', lastName: 'Bernard', role: 'Pilote', parentId: 'e8', teamId: 't2', departementId: 'd1', poleId: 'p1', celluleId: 'c1', email: 'diana.bernard@mykyntus.com' },
  { id: 'e5', firstName: 'Eve', lastName: 'Thomas', role: 'RH', teamId: 't5', departementId: 'd2', poleId: 'p3', celluleId: 'c4', email: 'eve.thomas@mykyntus.com' },
  { id: 'e6', firstName: 'Rachid', lastName: 'El Amrani', role: 'RP', teamId: 't1', departementId: 'd1', poleId: 'p1', celluleId: 'c1', email: 'rachid.elamrani@mykyntus.com' },
  { id: 'e7', firstName: 'Salma', lastName: 'Bennani', role: 'Audit', teamId: 't1', departementId: 'd1', poleId: 'p1', celluleId: 'c1', email: 'salma.bennani@mykyntus.com' },
  { id: 'e8', firstName: 'Marc', lastName: 'Lefèvre', role: 'Coach', parentId: 'e3', teamId: 't1', departementId: 'd1', poleId: 'p1', celluleId: 'c1', email: 'marc.lefevre@mykyntus.com' },
  { id: 'e-admin', firstName: 'Système', lastName: 'Admin', role: 'Admin', teamId: 't1', departementId: 'd1', poleId: 'p1', celluleId: 'c1', email: 'admin@mykyntus.com' },
];

export const mockPrimeTypes: PrimeType[] = [
  { id: 'pt1', name: 'Performance Bonus', type: 'Performance', departmentId: 'd1', status: 'Active', description: 'Monthly performance bonus for operations' },
  { id: 'pt2', name: 'Zero Error Bonus', type: 'Quality', departmentId: 'd1', status: 'Active', description: 'Bonus for 0 errors in a month' },
  { id: 'pt3', name: 'Overtime Bonus', type: 'Attendance', departmentId: 'd2', status: 'Inactive', description: 'Bonus for extra hours' },
  { id: 'pt4', name: 'Escalation Resolution Bonus', type: 'Performance', departmentId: 'd1', status: 'Active', description: 'Bonus for resolving escalations quickly' },
];

export const mockPrimeRules: PrimeRule[] = [
  {
    id: 'pr1',
    primeTypeId: 'pt1',
    departmentId: 'd1',
    conditionField: 'tickets_resolved',
    conditionType: '>',
    targetValue: 100,
    calculationMethod: 'Fixed',
    amount: 300,
    period: 'Monthly',
  },
  {
    id: 'pr2',
    primeTypeId: 'pt2',
    departmentId: 'd1',
    conditionField: 'errors',
    conditionType: '==',
    targetValue: 0,
    calculationMethod: 'Fixed',
    amount: 500,
    period: 'Monthly',
  },
];

export const mockPrimeResults: PrimeResult[] = [
  { id: 'res1', employeeId: 'e1', primeTypeId: 'pt1', score: 120, amount: 300, status: 'Pending', period: '2026-03', date: '2026-03-15' },
  { id: 'res2', employeeId: 'e2', primeTypeId: 'pt1', score: 95, amount: 0, status: 'Rejected', period: '2026-03', date: '2026-03-15' },
  { id: 'res3', employeeId: 'e4', primeTypeId: 'pt2', score: 0, amount: 500, status: 'Coach Approved', period: '2026-03', date: '2026-03-14' },
  { id: 'res4', employeeId: 'e1', primeTypeId: 'pt2', score: 0, amount: 500, status: 'RH Approved', period: '2026-02', date: '2026-02-28', approvedBy: 'e5' },
  { id: 'res5', employeeId: 'e2', primeTypeId: 'pt4', score: 15, amount: 450, status: 'RP Approved', period: '2026-03', date: '2026-03-10' },
  { id: 'res6', employeeId: 'e1', primeTypeId: 'pt1', score: 88, amount: 200, status: 'Manager Approved', period: '2026-03', date: '2026-03-12' },
];
