import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DocumentationShellComponent } from './layout/documentation-shell.component';
import { AuditPageComponent } from './pages/audit-page.component';
import { CreateRequestPageComponent } from './pages/create-request-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { DocumentTypesPageComponent } from './pages/document-types-page.component';
import { RequestDetailPageComponent } from './pages/request-detail-page.component';
import { RequestsListPageComponent } from './pages/requests-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentationShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'types', component: DocumentTypesPageComponent },
      { path: 'requests/new', component: CreateRequestPageComponent },
      { path: 'requests/:id', component: RequestDetailPageComponent },
      { path: 'requests', component: RequestsListPageComponent },
      { path: 'audit', component: AuditPageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentationRoutingModule {}
