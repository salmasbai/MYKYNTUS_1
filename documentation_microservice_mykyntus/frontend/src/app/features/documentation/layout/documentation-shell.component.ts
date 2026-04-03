import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DocumentationHeaders } from '../../../core/constants/documentation-headers';
import {
  DocumentationNotificationService,
  DocumentationToast,
} from '../../../core/services/documentation-notification.service';

@Component({
  selector: 'app-documentation-shell',
  templateUrl: './documentation-shell.component.html',
  styleUrls: ['./documentation-shell.component.css'],
})
export class DocumentationShellComponent implements OnInit, OnDestroy {
  readonly headers = DocumentationHeaders;

  toast: DocumentationToast | null = null;

  private sub?: Subscription;

  constructor(private readonly notifications: DocumentationNotificationService) {}

  ngOnInit(): void {
    this.sub = this.notifications.toast$.subscribe((t) => {
      this.toast = t;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  dismissToast(): void {
    this.notifications.clear();
  }
}
