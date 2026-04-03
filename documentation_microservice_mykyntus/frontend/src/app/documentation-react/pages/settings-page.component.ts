import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';
import type { DirectoryUserDto } from '../../shared/models/api.models';
import type { DocumentationRole } from '../interfaces/documentation-role';
import { formatOrgCompactLine, getPersonalOrgLabelsForViewer } from '../lib/personal-org-labels';
import type { NotificationPreferences } from '../models/notification-preferences.model';
import { AppContextService } from '../services/app-context.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';
import { SettingsStorageService } from '../services/settings-storage.service';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';

const ROLE_LABEL_API: Record<string, string> = {
  pilote: 'Pilote',
  coach: 'Coach',
  manager: 'Manager',
  rp: 'Responsable projet',
  rh: 'RH',
  admin: 'Administrateur',
  audit: 'Audit',
};

const NOTIFICATION_PREF_ROWS: Array<{ key: keyof NotificationPreferences; label: string }> = [
  { key: 'inApp', label: 'Notifications dans l’application' },
  { key: 'email', label: 'E-mails' },
  { key: 'referrals', label: 'Nouveaux parrainages' },
  { key: 'approvals', label: 'Approbations / refus' },
  { key: 'payments', label: 'Récompenses & versements' },
  { key: 'systemAlerts', label: 'Alertes système' },
];

@Component({
  standalone: true,
  selector: 'app-settings-page',
  imports: [CommonModule, FormsModule, DocIconComponent],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent implements OnInit {
  prefs!: NotificationPreferences;
  saved = false;
  compactMode = false;

  readonly notificationPrefRows = NOTIFICATION_PREF_ROWS;
  readonly role$ = this.nav.role$;
  readonly profile$ = this.identity.profile$;
  readonly directoryUsers$ = this.identity.directoryUsers$;

  constructor(
    readonly app: AppContextService,
    private readonly nav: DocumentationNavigationService,
    private readonly settings: SettingsStorageService,
    readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.prefs = this.settings.getNotificationPreferences();
  }

  persistPrefs(next: NotificationPreferences): void {
    this.prefs = next;
    this.settings.updateNotificationPreferences(next);
    this.saved = true;
    window.setTimeout(() => (this.saved = false), 2000);
  }

  togglePref(key: keyof NotificationPreferences): void {
    this.persistPrefs({ ...this.prefs, [key]: !this.prefs[key] });
  }

  prefEnabled(key: keyof NotificationPreferences): boolean {
    return this.prefs[key] !== false;
  }

  persistUi(compact: boolean): void {
    this.compactMode = compact;
  }

  orgCompact(role: DocumentationRole): string {
    const uid = this.identity.getCurrentUserId();
    const org = getPersonalOrgLabelsForViewer(uid || undefined, role);
    return formatOrgCompactLine({
      departement: org.departement,
      pole: org.pole,
      cellule: org.cellule,
    });
  }

  roleLabelFromProfile(profile: DirectoryUserDto | null): string {
    if (!profile?.role) return '—';
    return ROLE_LABEL_API[profile.role.trim().toLowerCase()] ?? profile.role;
  }

  directoryUserLine(u: DirectoryUserDto): string {
    return `${u.prenom} ${u.nom} · ${this.roleLabelFromProfile(u)} · ${u.email}`;
  }
}
