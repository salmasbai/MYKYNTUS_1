import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { map, startWith } from 'rxjs';

import type { DirectoryUserDto } from '../../../shared/models/api.models';
import { DocumentationIdentityService } from '../../../core/services/documentation-identity.service';
import { AppContextService } from '../../services/app-context.service';
import { DocumentationNavigationService } from '../../services/documentation-navigation.service';
import { NotificationDataService } from '../../services/notification-data.service';
import { DocIconComponent } from '../doc-icon/doc-icon.component';

@Component({
  selector: 'app-documentation-header',
  standalone: true,
  imports: [CommonModule, DocIconComponent],
  templateUrl: './documentation-header.component.html',
})
export class DocumentationHeaderComponent {
  @Input({ required: true }) title!: string;

  notificationOpen = false;

  readonly unread$ = this.notifications.updated$.pipe(
    startWith(0),
    map(() => this.notifications.unreadCount()),
  );

  readonly profile$ = this.identity.profile$;

  constructor(
    readonly app: AppContextService,
    private readonly nav: DocumentationNavigationService,
    readonly notifications: NotificationDataService,
    readonly identity: DocumentationIdentityService,
  ) {}

  avatarInitials(u: DirectoryUserDto | null): string {
    if (!u?.prenom && !u?.nom) return '?';
    const a = (u.prenom?.charAt(0) ?? '').toUpperCase();
    const b = (u.nom?.charAt(0) ?? '').toUpperCase();
    const s = (a + b).trim();
    return s || '?';
  }

  displayName(u: DirectoryUserDto | null): string {
    if (!u) return '—';
    const t = `${u.prenom ?? ''} ${u.nom ?? ''}`.trim();
    return t || '—';
  }

  toggleTheme(): void {
    this.app.toggleTheme();
  }

  get isDark(): boolean {
    return this.app.theme === 'dark';
  }

  toggleNotifications(): void {
    this.notificationOpen = !this.notificationOpen;
  }

  closeNotifications(): void {
    this.notificationOpen = false;
  }

  openAllNotifications(): void {
    this.notificationOpen = false;
    this.nav.navigateToTab('notifications');
  }

  markAllReadFromDropdown(): void {
    this.notifications.markAllRead();
  }

  goSettings(): void {
    this.nav.navigateToTab('settings');
  }
}
