import { Component, OnInit } from '@angular/core';

import { AuditJournalPageComponent } from '../components/audit-journal-page/audit-journal-page.component';
import { AuditInterfaceNavService } from '../services/audit-interface-nav.service';

@Component({
  standalone: true,
  selector: 'app-audit-logs-page',
  imports: [AuditJournalPageComponent],
  template: '<app-audit-journal-page [title]="title"></app-audit-journal-page>',
})
export class AuditLogsPageComponent implements OnInit {
  readonly title = "Journal d'audit";

  constructor(private readonly auditNav: AuditInterfaceNavService) {}

  ngOnInit(): void {
    this.auditNav.setSection('journal');
  }
}
