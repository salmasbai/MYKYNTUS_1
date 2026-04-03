import { Component, OnInit } from '@angular/core';

import { AuditJournalPageComponent } from '../components/audit-journal-page/audit-journal-page.component';
import { AuditInterfaceNavService } from '../services/audit-interface-nav.service';

@Component({
  standalone: true,
  selector: 'app-access-history-page',
  imports: [AuditJournalPageComponent],
  template: '<app-audit-journal-page [title]="title"></app-audit-journal-page>',
})
export class AccessHistoryPageComponent implements OnInit {
  readonly title = "Historique d'accès";

  constructor(private readonly auditNav: AuditInterfaceNavService) {}

  ngOnInit(): void {
    this.auditNav.setSection('access-history');
  }
}
