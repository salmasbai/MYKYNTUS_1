import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { DocumentationRoutingModule } from './documentation-routing.module';
import { DocumentationShellComponent } from './layout/documentation-shell.component';
import { AuditPageComponent } from './pages/audit-page.component';
import { CreateRequestPageComponent } from './pages/create-request-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { DocumentTypesPageComponent } from './pages/document-types-page.component';
import { RequestDetailPageComponent } from './pages/request-detail-page.component';
import { RequestsListPageComponent } from './pages/requests-list-page.component';

@NgModule({
  declarations: [
    DocumentationShellComponent,
    DashboardPageComponent,
    DocumentTypesPageComponent,
    RequestsListPageComponent,
    RequestDetailPageComponent,
    CreateRequestPageComponent,
    AuditPageComponent,
  ],
  imports: [SharedModule, DocumentationRoutingModule],
})
export class DocumentationModule {}
