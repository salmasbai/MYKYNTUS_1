import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DocumentationIdentityService } from '../../../core/services/documentation-identity.service';
import { environment } from '../../../../environments/environment';
import type { DocumentationRole } from '../../interfaces/documentation-role';
import { mapApiRoleToDocumentationRole } from '../../lib/map-api-documentation-role';
import { AppContextService } from '../../services/app-context.service';
import { AuditInterfaceNavService } from '../../services/audit-interface-nav.service';
import type { AuditInterfaceSectionId } from '../../services/audit-interface-nav.service';
import { DocumentationNavigationService, type DocumentationTabId } from '../../services/documentation-navigation.service';
import { DocIconComponent } from '../doc-icon/doc-icon.component';

export interface SidebarNavItem {
  id: DocumentationTabId;
  labelKey: string;
  icon: string;
}

export interface AuditSidebarNavItem {
  key: string;
  label?: string;
  labelKey?: string;
  icon: string;
  tab: DocumentationTabId;
  section: AuditInterfaceSectionId;
}

@Component({
  selector: 'app-documentation-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, DocIconComponent],
  templateUrl: './documentation-sidebar.component.html',
  styleUrl: './documentation-sidebar.component.scss',
})
export class DocumentationSidebarComponent implements OnInit, OnDestroy {
  /** Bandeau dev fixed en tête : décale la sidebar sous le ruban (pleine largeur écran). */
  @Input() stackBelowDevBanner = false;

  /** Aligné sur le service : !collapsed ⇔ sidebar « ouverte » (large) */
  readonly collapsed = toSignal(this.nav.sidebarCollapsed$, { initialValue: false });
  readonly role = toSignal(this.nav.role$, { initialValue: 'Pilote' as DocumentationRole });
  readonly activeTab = toSignal(this.nav.activeTab$, { initialValue: 'dashboard' as DocumentationTabId });
  readonly auditSec = toSignal(this.auditNav.section$, { initialValue: 'journal' });

  readonly devUserPicker = !environment.production;
  selectedDevUserId = '';
  private sub = new Subscription();

  readonly piloteNavItems: SidebarNavItem[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'layout-dashboard' },
    { id: 'my-docs', labelKey: 'nav.myDocs', icon: 'file-text' },
    { id: 'request', labelKey: 'nav.requestDoc', icon: 'plus-circle' },
    { id: 'tracking', labelKey: 'nav.requestTracking', icon: 'history' },
    { id: 'notifications', labelKey: 'nav.notifications', icon: 'bell' },
    { id: 'settings', labelKey: 'nav.settings', icon: 'settings' },
  ];

  readonly auditNavItems: AuditSidebarNavItem[] = [
    { key: 'journal', label: 'Journal d’audit', icon: 'activity', tab: 'audit-logs', section: 'journal' },
    { key: 'hist', labelKey: 'nav.accessHistory', icon: 'shield', tab: 'access-history', section: 'access-history' },
    { key: 'anom', label: 'Anomalies', icon: 'alert-triangle', tab: 'audit-logs', section: 'anomalies' },
    { key: 'report', label: 'Reporting', icon: 'bar-chart', tab: 'audit-logs', section: 'reporting' },
    { key: 'notif', labelKey: 'nav.notifications', icon: 'bell', tab: 'notifications', section: 'journal' },
    { key: 'sett', labelKey: 'nav.settings', icon: 'settings', tab: 'settings', section: 'journal' },
  ];

  constructor(
    readonly nav: DocumentationNavigationService,
    readonly app: AppContextService,
    readonly auditNav: AuditInterfaceNavService,
    readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.selectedDevUserId = this.identity.getCurrentUserId();
    this.sub.add(
      this.identity.profile$.subscribe((p) => {
        if (p) {
          this.selectedDevUserId = p.id;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onDevUserPicked(userId: string): void {
    const u = this.identity.directoryUsers$.getValue().find((x) => x.id === userId);
    if (!u) {
      return;
    }
    this.identity.selectDevUser(u);
    this.nav.setRole(mapApiRoleToDocumentationRole(u.role));
  }

  get isSidebarOpen(): boolean {
    return !this.nav.isSidebarCollapsed;
  }

  /** Ouverture / fermeture uniquement via le bouton ☰ — ne pas appeler depuis la navigation */
  toggleSidebar(): void {
    this.nav.toggleSidebar();
  }

  navigate(tab: DocumentationTabId): void {
    this.nav.navigateToTab(tab);
  }

  auditSelect(section: AuditInterfaceSectionId, tab: DocumentationTabId): void {
    this.auditNav.setSection(section);
    this.nav.navigateToTab(tab);
  }

  auditItemActive(
    item: AuditSidebarNavItem,
    activeTab: DocumentationTabId,
    auditSec: AuditInterfaceSectionId,
  ): boolean {
    if (item.key === 'notif') return activeTab === 'notifications';
    if (item.key === 'sett') return activeTab === 'settings';
    if (item.tab === 'access-history') return activeTab === 'access-history';
    return activeTab === item.tab && auditSec === item.section;
  }

  managementItems(role: DocumentationRole): SidebarNavItem[] {
    const managerItems: SidebarNavItem[] = [
      { id: 'team-docs', labelKey: 'nav.teamDocs', icon: 'users' },
      { id: 'team-requests', labelKey: 'nav.teamRequests', icon: 'clipboard-list' },
      { id: 'notifications', labelKey: 'nav.notifications', icon: 'bell' },
      { id: 'settings', labelKey: 'nav.settings', icon: 'settings' },
    ];
    const hrItems: SidebarNavItem[] = [
      { id: 'hr-mgmt', labelKey: 'nav.allRequests', icon: 'settings' },
      { id: 'doc-gen', labelKey: 'nav.docGen', icon: 'file-edit' },
      { id: 'templates', labelKey: 'nav.templates', icon: 'settings' },
      { id: 'notifications', labelKey: 'nav.notifications', icon: 'bell' },
      { id: 'settings', labelKey: 'nav.settings', icon: 'settings' },
    ];
    const rpItems: SidebarNavItem[] = [
      { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'layout-dashboard' },
      { id: 'team-docs', labelKey: 'nav.teamDocs', icon: 'users' },
      { id: 'hr-mgmt', labelKey: 'nav.allRequests', icon: 'settings' },
      { id: 'notifications', labelKey: 'nav.notifications', icon: 'bell' },
      { id: 'settings', labelKey: 'nav.settings', icon: 'settings' },
    ];
    const adminItems: SidebarNavItem[] = [
      { id: 'admin-config', labelKey: 'nav.adminConfig', icon: 'settings' },
      { id: 'doc-types', labelKey: 'nav.docTypes', icon: 'layers' },
      { id: 'permissions', labelKey: 'nav.permissions', icon: 'lock' },
      { id: 'storage', labelKey: 'nav.storage', icon: 'hard-drive' },
      { id: 'notifications', labelKey: 'nav.notifications', icon: 'bell' },
      { id: 'settings', labelKey: 'nav.settings', icon: 'settings' },
    ];
    switch (role) {
      case 'Manager':
      case 'Coach':
        return managerItems;
      case 'RH':
        return hrItems;
      case 'RP':
        return rpItems;
      case 'Admin':
        return adminItems;
      default:
        return [];
    }
  }
}
