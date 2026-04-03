import { Routes } from '@angular/router';

import { AccessHistoryPageComponent } from './pages/access-history-page.component';
import { AdminConfigPageComponent } from './pages/admin-config-page.component';
import { AdminDocTypesPageComponent } from './pages/admin-doc-types-page.component';
import { AdminPermissionsPageComponent } from './pages/admin-permissions-page.component';
import { AdminStoragePageComponent } from './pages/admin-storage-page.component';
import { AdminWorkflowPageComponent } from './pages/admin-workflow-page.component';
import { AuditLogsPageComponent } from './pages/audit-logs-page.component';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { DocumentationShellComponent } from './components/documentation-shell/documentation-shell.component';
import { DocGenPageComponent } from './pages/doc-gen-page.component';
import { HrManagementPageComponent } from './pages/hr-management-page.component';
import { MyDocumentsPageComponent } from './pages/my-documents-page.component';
import { NotificationsPageComponent } from './pages/notifications-page.component';
import { RequestDocumentPageComponent } from './pages/request-document-page.component';
import { RequestTrackingPageComponent } from './pages/request-tracking-page.component';
import { SettingsPageComponent } from './pages/settings-page.component';
import { TeamDocumentsPageComponent } from './pages/team-documents-page.component';
import { TeamRequestsPageComponent } from './pages/team-requests-page.component';
import { TemplatesPageComponent } from './pages/templates-page.component';

export const DOCUMENTATION_REACT_ROUTES: Routes = [
  {
    path: '',
    component: DocumentationShellComponent,
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'my-docs', component: MyDocumentsPageComponent },
      { path: 'request', component: RequestDocumentPageComponent },
      { path: 'tracking', component: RequestTrackingPageComponent },
      { path: 'notifications', component: NotificationsPageComponent },
      { path: 'settings', component: SettingsPageComponent },
      { path: 'team-docs', component: TeamDocumentsPageComponent },
      { path: 'team-requests', component: TeamRequestsPageComponent },
      { path: 'hr-mgmt', component: HrManagementPageComponent },
      { path: 'doc-gen', component: DocGenPageComponent },
      { path: 'templates', component: TemplatesPageComponent },
      { path: 'admin-config', component: AdminConfigPageComponent },
      { path: 'doc-types', component: AdminDocTypesPageComponent },
      { path: 'permissions', component: AdminPermissionsPageComponent },
      { path: 'workflow', component: AdminWorkflowPageComponent },
      { path: 'storage', component: AdminStoragePageComponent },
      { path: 'audit-logs', component: AuditLogsPageComponent },
      { path: 'access-history', component: AccessHistoryPageComponent },
    ],
  },
];
