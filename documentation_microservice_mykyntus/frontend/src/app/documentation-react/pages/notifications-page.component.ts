import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import type { NotificationFilter, NotificationItemUi } from '../models/notification-item.model';
import { NotificationDataService } from '../services/notification-data.service';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';

@Component({
  standalone: true,
  selector: 'app-notifications-page',
  imports: [CommonModule, DocIconComponent],
  templateUrl: './notifications-page.component.html',
})
export class NotificationsPageComponent {
  filter: NotificationFilter = 'all';

  readonly filterOptions: NotificationFilter[] = ['all', 'unread', 'system', 'documents'];

  constructor(readonly notifications: NotificationDataService) {}

  setFilter(f: NotificationFilter): void {
    this.filter = f;
  }

  filteredItems(): NotificationItemUi[] {
    return this.notifications.list().filter((n) => {
      if (this.filter === 'all') return true;
      if (this.filter === 'unread') return !n.read;
      return n.type === this.filter;
    });
  }

  grouped(): Record<string, NotificationItemUi[]> {
    return this.filteredItems().reduce(
      (acc, notification) => {
        if (!acc[notification.dateGroup]) acc[notification.dateGroup] = [];
        acc[notification.dateGroup].push(notification);
        return acc;
      },
      {} as Record<string, NotificationItemUi[]>,
    );
  }

  unreadCount(): number {
    return this.notifications.list().filter((n) => !n.read).length;
  }

  markAll(): void {
    this.notifications.markAllRead();
  }

  markOne(id: string): void {
    this.notifications.markRead(id);
  }

  deleteOne(id: string): void {
    this.notifications.remove(id);
  }
}
