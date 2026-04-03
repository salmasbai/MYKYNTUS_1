import { Document, Request, Template, AuditLog } from './types';
import { ORG_DEMO_IDS } from './lib/documentationOrgHierarchy';

export const MOCK_DOCUMENTS: Document[] = [
  { id: '1', name: 'Work_Certificate_2023.pdf', type: 'Work Certificate', dateCreated: '2023-12-15', status: 'Generated', employeeId: ORG_DEMO_IDS.pilote, employeeName: 'John Doe' },
  { id: '2', name: 'Salary_Slip_Jan_2024.pdf', type: 'Salary Certificate', dateCreated: '2024-01-31', status: 'Generated', employeeId: ORG_DEMO_IDS.pilote, employeeName: 'John Doe' },
  { id: '3', name: 'Employment_Contract_V2.pdf', type: 'Contract', dateCreated: '2023-06-01', status: 'Generated', employeeId: ORG_DEMO_IDS.pilote, employeeName: 'John Doe' },
  { id: '4', name: 'Training_Certificate_React.pdf', type: 'Training Certificate', dateCreated: '2024-02-10', status: 'Generated', employeeId: ORG_DEMO_IDS.pilote2, employeeName: 'Jane Smith' },
];

export const MOCK_REQUESTS: Request[] = [
  { id: 'REQ-001', type: 'Work Certificate', requestDate: '2024-03-01', status: 'Approved', employeeName: 'John Doe', employeeId: ORG_DEMO_IDS.pilote, reason: 'Bank Loan Application' },
  { id: 'REQ-002', type: 'Salary Certificate', requestDate: '2024-03-05', status: 'Pending', employeeName: 'John Doe', employeeId: ORG_DEMO_IDS.pilote, reason: 'Visa Application' },
  { id: 'REQ-003', type: 'Training Certificate', requestDate: '2024-02-20', status: 'Generated', employeeName: 'Jane Smith', employeeId: ORG_DEMO_IDS.pilote2 },
  { id: 'REQ-004', type: 'Work Certificate', requestDate: '2024-03-08', status: 'Rejected', employeeName: 'Mike Ross', employeeId: ORG_DEMO_IDS.pilote2, reason: 'Insufficient data' },
];

export const MOCK_TEMPLATES: Template[] = [
  { id: 'T-001', name: 'Standard Work Certificate', lastModified: '2024-01-10', variables: ['EmployeeName', 'Department', 'Position', 'Date'] },
  { id: 'T-002', name: 'Salary Certificate (English)', lastModified: '2024-02-15', variables: ['EmployeeName', 'Salary', 'Manager', 'Date'] },
  { id: 'T-003', name: 'Internship Completion', lastModified: '2023-11-20', variables: ['EmployeeName', 'Duration', 'Department'] },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'L-001', action: 'Generated', documentName: 'Work_Certificate_John.pdf', user: 'HR_Sarah', timestamp: '2024-03-09 10:30' },
  { id: 'L-002', action: 'Downloaded', documentName: 'Salary_Slip_Jan.pdf', user: 'John_Doe', timestamp: '2024-03-09 11:15' },
  { id: 'L-003', action: 'Approved', documentName: 'REQ-001', user: 'Manager_Bob', timestamp: '2024-03-08 16:45' },
];

export const MOCK_TEAM_DOCS: Document[] = [
  { id: 'T1', name: 'Work_Cert_Alice.pdf', type: 'Work Certificate', dateCreated: '2024-03-01', status: 'Generated', employeeId: ORG_DEMO_IDS.pilote, employeeName: 'Alice Johnson', department: 'Engineering' },
  { id: 'T2', name: 'Salary_Cert_Bob.pdf', type: 'Salary Certificate', dateCreated: '2024-03-02', status: 'Generated', employeeId: ORG_DEMO_IDS.pilote2, employeeName: 'Bob Smith', department: 'Engineering' },
];
