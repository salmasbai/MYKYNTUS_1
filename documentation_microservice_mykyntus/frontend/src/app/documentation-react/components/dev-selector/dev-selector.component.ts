import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, combineLatest, forkJoin, of } from 'rxjs';

import { DocumentationHeaders } from '../../../core/constants/documentation-headers';
import { DocumentationDataApiService } from '../../../core/services/documentation-data-api.service';
import { DocumentationIdentityService } from '../../../core/services/documentation-identity.service';
import { environment } from '../../../../environments/environment';
import type { DocumentationRole } from '../../interfaces/documentation-role';
import { mapApiRoleToDocumentationRole } from '../../lib/map-api-documentation-role';
import { mapDocumentationRoleToApiRole } from '../../lib/map-documentation-role-to-api';
import { DocumentationNavigationService } from '../../services/documentation-navigation.service';
import type { DirectoryUserDto, OrganizationalUnitSummaryDto } from '../../../shared/models/api.models';

const ROLE_OPTIONS: DocumentationRole[] = [
  'Pilote',
  'Coach',
  'Manager',
  'RP',
  'RH',
  'Admin',
  'Audit',
];

@Component({
  selector: 'app-dev-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './dev-selector.component.html',
  styleUrl: './dev-selector.component.scss',
})
export class DevSelectorComponent implements OnInit, OnDestroy {
  readonly enabled = environment.documentationDevToolsEnabled && !environment.production;
  readonly headers = DocumentationHeaders;

  roleOptions = ROLE_OPTIONS;
  selectedRole: DocumentationRole = 'Pilote';

  poles: OrganizationalUnitSummaryDto[] = [];
  cellules: OrganizationalUnitSummaryDto[] = [];
  departements: OrganizationalUnitSummaryDto[] = [];
  selectedPoleId = '';
  selectedCelluleId = '';
  selectedDepartementId = '';

  /** Listes issues des endpoints filtrés (aucune donnée métier codée en dur). */
  scopedUsersForRole: DirectoryUserDto[] = [];
  managersForDept: DirectoryUserDto[] = [];
  coachesForManager: DirectoryUserDto[] = [];
  rpUsersForDept: DirectoryUserDto[] = [];

  selectedUserId = '';
  selectedManagerUserId = '';
  selectedCoachScopeId = '';
  selectedRpUserId = '';
  selectedRpScopeManagerId = '';
  selectedRpScopeCoachId = '';

  /** Message si l’API org ne répond pas ou renvoie une liste vide (aide au diagnostic). */
  orgLoadHint: string | null = null;

  private sub = new Subscription();

  constructor(
    public readonly identity: DocumentationIdentityService,
    private readonly nav: DocumentationNavigationService,
    private readonly data: DocumentationDataApiService,
  ) {}

  currentTenantId(): string {
    return this.identity.getTenantId() || '—';
  }

  ngOnInit(): void {
    if (!this.enabled) {
      return;
    }
    const tenantDefault =
      environment.documentationUserContextHeaders?.[DocumentationHeaders.tenantId]?.trim() ?? '';
    if (tenantDefault && !this.identity.getTenantId()) {
      this.identity.setTenantId(tenantDefault);
    }

    this.sub.add(
      combineLatest([this.identity.profile$, this.nav.role$]).subscribe(([prof, uiRole]) => {
        if (prof?.role) {
          try {
            this.selectedRole = mapApiRoleToDocumentationRole(prof.role);
          } catch {
            this.selectedRole = uiRole;
          }
        } else {
          this.selectedRole = uiRole;
        }
      }),
    );

    queueMicrotask(() => this.startOrganisationCascade());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  apiRoleForSelected(): string {
    return mapDocumentationRoleToApiRole(this.selectedRole);
  }

  orgSelectionComplete(): boolean {
    return !!(this.selectedPoleId && this.selectedCelluleId && this.selectedDepartementId);
  }

  onPoleChange(poleId: string): void {
    this.selectedPoleId = poleId;
    this.selectedCelluleId = '';
    this.selectedDepartementId = '';
    this.cellules = [];
    this.departements = [];
    this.loadCellulesForPole(poleId);
  }

  onCelluleChange(celluleId: string): void {
    this.selectedCelluleId = celluleId;
    this.selectedDepartementId = '';
    this.departements = [];
    this.loadDepartementsForCellule(celluleId);
  }

  onDepartementChange(departementId: string): void {
    this.selectedDepartementId = departementId;
    this.refreshOrgScopedLists();
  }

  onRoleChange(role: DocumentationRole): void {
    this.identity.clearOrgScope();
    this.selectedRole = role;
    const apiRole = mapDocumentationRoleToApiRole(role);
    // RH / Admin / Audit voient tout le tenant côté API : ne pas attendre pôle–cellule–département
    // (sinon scopedUsersForRole reste vide → en-têtes inchangées → file RH filtrée comme pilote).
    if (apiRole === 'rh' || apiRole === 'admin' || apiRole === 'audit') {
      this.refreshOrgScopedLists();
      return;
    }
    if (this.orgSelectionComplete()) {
      this.refreshOrgScopedLists();
    }
  }

  onUserChange(userId: string): void {
    this.selectedUserId = userId;
    const u = this.scopedUsersForRole.find((x) => x.id === userId);
    if (u) {
      this.applyStandardUser(u);
    }
  }

  onManagerIdentityChange(managerId: string): void {
    this.selectedManagerUserId = managerId;
    this.selectedCoachScopeId = '';
    this.reloadCoachesForManagerContext();
  }

  onCoachScopeChange(coachId: string): void {
    this.selectedCoachScopeId = coachId;
    const mgr = this.managersForDept.find((m) => m.id === this.selectedManagerUserId);
    const coach = this.coachesForManager.find((c) => c.id === coachId);
    if (mgr && coach) {
      this.applyManagerContext(mgr, coach);
    }
  }

  onRpManagerChange(managerId: string): void {
    this.selectedRpScopeManagerId = managerId;
    this.selectedRpScopeCoachId = '';
    this.reloadCoachesForManagerContext();
  }

  onRpCoachChange(coachId: string): void {
    this.selectedRpScopeCoachId = coachId;
    this.applyRpContext();
  }

  onRpUserChange(userId: string): void {
    this.selectedRpUserId = userId;
    this.applyRpContext();
  }

  displayLine(): string {
    const p = this.identity.profile$.value;
    if (!p) {
      return '—';
    }
    const name = `${p.prenom ?? ''} ${p.nom ?? ''}`.trim() || p.email || p.id;
    const r = p.role?.trim() ?? '';
    const sm = this.identity.scopeManagerId$.value;
    const sc = this.identity.scopeCoachId$.value;
    let scope = '';
    if (sc) {
      scope = ` · périmètre coach ${sc.slice(0, 8)}…`;
    }
    if (sm) {
      scope += ` · manager ${sm.slice(0, 8)}…`;
    }
    return `${name} (${r})${scope}`;
  }

  private startOrganisationCascade(): void {
    this.orgLoadHint = null;
    this.data.getOrganisationPoles().subscribe({
      next: (poles) => {
        this.poles = poles;
        if (!poles.length) {
          this.orgLoadHint =
            `Aucun pôle pour le tenant « ${this.identity.getTenantId() || '—'} ». Vérifiez la table documentation.organisation_units (seed SQL 008) et que l’API utilise la même base.`;
          return;
        }
        if (!this.selectedPoleId) {
          this.selectedPoleId = poles[0].id;
        }
        this.loadCellulesForPole(this.selectedPoleId);
      },
      error: (err) => {
        this.poles = [];
        const status = err?.status != null ? ` HTTP ${err.status}` : '';
        const hint404 =
          status.includes('404')
            ? ' Les routes /api/documentation/data/organisation/* sont absentes : recompilez et redémarrez le projet DocumentationBackend depuis ce dépôt. '
            : ' ';
        this.orgLoadHint = `Échec du chargement des pôles${status}.${hint404}Vérifiez ${environment.apiBaseUrl}, les en-têtes X-Tenant-Id / X-User-Id, et que ce n’est pas un autre service sur ce port.`;
      },
    });
  }

  private loadCellulesForPole(poleId: string): void {
    this.data.getCellulesByPole(poleId).subscribe({
      next: (cells) => {
        this.cellules = cells;
        if (!cells.length) {
          this.departements = [];
          this.orgLoadHint = 'Aucune cellule pour ce pôle (parent_id en base).';
          return;
        }
        if (!this.selectedCelluleId || !cells.some((c) => c.id === this.selectedCelluleId)) {
          this.selectedCelluleId = cells[0].id;
        }
        this.loadDepartementsForCellule(this.selectedCelluleId);
      },
      error: () => {
        this.cellules = [];
        this.orgLoadHint = 'Impossible de charger les cellules pour le pôle sélectionné.';
      },
    });
  }

  private loadDepartementsForCellule(celluleId: string): void {
    this.data.getDepartementsByCellule(celluleId).subscribe({
      next: (depts) => {
        this.departements = depts;
        if (!depts.length) {
          this.orgLoadHint = 'Aucun département pour cette cellule (parent_id en base).';
          return;
        }
        this.orgLoadHint = null;
        if (!this.selectedDepartementId || !depts.some((d) => d.id === this.selectedDepartementId)) {
          this.selectedDepartementId = depts[0].id;
        }
        this.refreshOrgScopedLists();
      },
      error: () => {
        this.departements = [];
        this.orgLoadHint = 'Impossible de charger les départements pour la cellule sélectionnée.';
      },
    });
  }

  private refreshOrgScopedLists(): void {
    const apiRoleEarly = mapDocumentationRoleToApiRole(this.selectedRole);
    if (apiRoleEarly === 'rh' || apiRoleEarly === 'admin' || apiRoleEarly === 'audit') {
      this.data.getDirectoryUsers().subscribe({
        next: (std) => {
          this.scopedUsersForRole = std.filter((u) => u.role.toLowerCase() === apiRoleEarly);
          this.managersForDept = [];
          this.coachesForManager = [];
          this.rpUsersForDept = [];
          if (
            ['Pilote', 'Coach', 'RH', 'Admin', 'Audit'].includes(this.selectedRole) &&
            this.scopedUsersForRole.length &&
            !this.selectedUserId
          ) {
            this.selectedUserId = this.scopedUsersForRole[0].id;
          }
          this.finalizeDevContext();
        },
        error: () => {
          this.scopedUsersForRole = [];
          this.managersForDept = [];
          this.coachesForManager = [];
          this.rpUsersForDept = [];
        },
      });
      return;
    }

    const pole = this.selectedPoleId;
    const cell = this.selectedCelluleId;
    const dept = this.selectedDepartementId;
    if (!pole || !cell || !dept) {
      this.scopedUsersForRole = [];
      this.managersForDept = [];
      this.coachesForManager = [];
      this.rpUsersForDept = [];
      return;
    }

    this.data.getManagersByDepartement(dept).subscribe({
      next: (managers) => {
        this.managersForDept = managers;
        if (this.selectedRole === 'Manager' && managers.length) {
          if (!this.selectedManagerUserId || !managers.some((m) => m.id === this.selectedManagerUserId)) {
            this.selectedManagerUserId = managers[0].id;
          }
        }
        if (this.selectedRole === 'RP' && managers.length) {
          if (!this.selectedRpScopeManagerId || !managers.some((m) => m.id === this.selectedRpScopeManagerId)) {
            this.selectedRpScopeManagerId = managers[0].id;
          }
        }

        const mgrId =
          this.selectedRole === 'Manager'
            ? this.selectedManagerUserId
            : this.selectedRole === 'RP'
              ? this.selectedRpScopeManagerId
              : '';

        const apiRole = mapDocumentationRoleToApiRole(this.selectedRole);

        // RH/Admin/Audit doivent pouvoir voir l'ensemble du tenant (pas seulement le département sélectionné).
        const std$ =
          apiRole === 'rh' || apiRole === 'admin' || apiRole === 'audit'
            ? this.data.getDirectoryUsers()
            : ['pilote', 'coach'].includes(apiRole)
              ? this.data.getUsersByRoleAndOrg(apiRole, pole, cell, dept)
              : of([] as DirectoryUserDto[]);

        const rp$ =
          this.selectedRole === 'RP'
            ? this.data.getUsersByRoleAndOrg('rp', pole, cell, dept)
            : of([] as DirectoryUserDto[]);

        const coaches$ =
          mgrId && (this.selectedRole === 'Manager' || this.selectedRole === 'RP')
            ? this.data.getCoachsByManager(mgrId, dept)
            : of([] as DirectoryUserDto[]);

        forkJoin({ std: std$, rp: rp$, coaches: coaches$ }).subscribe({
          next: ({ std, rp, coaches }) => {
            this.scopedUsersForRole =
              apiRole === 'rh' || apiRole === 'admin' || apiRole === 'audit'
                ? std.filter((u) => u.role.toLowerCase() === apiRole)
                : std;
            this.rpUsersForDept = rp;
            this.coachesForManager = coaches;
            if (this.selectedRole === 'Manager' && coaches.length && !this.selectedCoachScopeId) {
              this.selectedCoachScopeId = coaches[0].id;
            }
            if (this.selectedRole === 'RP' && coaches.length && !this.selectedRpScopeCoachId) {
              this.selectedRpScopeCoachId = coaches[0].id;
            }
            if (this.selectedRole === 'RP' && rp.length && !this.selectedRpUserId) {
              this.selectedRpUserId = rp[0].id;
            }
            if (
              ['Pilote', 'Coach', 'RH', 'Admin', 'Audit'].includes(this.selectedRole) &&
              std.length &&
              !this.selectedUserId
            ) {
              this.selectedUserId = std[0].id;
            }
            this.finalizeDevContext();
          },
          error: () => {
            this.scopedUsersForRole = [];
            this.rpUsersForDept = [];
            this.coachesForManager = [];
          },
        });
      },
      error: () => {
        this.managersForDept = [];
      },
    });
  }

  private reloadCoachesForManagerContext(): void {
    const pole = this.selectedPoleId;
    const cell = this.selectedCelluleId;
    const dept = this.selectedDepartementId;
    if (!pole || !cell || !dept) {
      return;
    }
    const mgrId =
      this.selectedRole === 'Manager'
        ? this.selectedManagerUserId
        : this.selectedRole === 'RP'
          ? this.selectedRpScopeManagerId
          : '';
    if (!mgrId) {
      this.coachesForManager = [];
      return;
    }
    this.data.getCoachsByManager(mgrId, dept).subscribe({
      next: (coaches) => {
        this.coachesForManager = coaches;
        if (coaches.length) {
          if (this.selectedRole === 'Manager') {
            this.selectedCoachScopeId = coaches[0].id;
          }
          if (this.selectedRole === 'RP') {
            this.selectedRpScopeCoachId = coaches[0].id;
          }
        }
        this.finalizeDevContext();
      },
      error: () => {
        this.coachesForManager = [];
      },
    });
  }

  private finalizeDevContext(): void {
    if (this.selectedRole === 'Pilote' || this.selectedRole === 'Coach' || this.selectedRole === 'RH' || this.selectedRole === 'Admin' || this.selectedRole === 'Audit') {
      const u = this.scopedUsersForRole.find((x) => x.id === this.selectedUserId) ?? this.scopedUsersForRole[0];
      if (u) {
        this.selectedUserId = u.id;
        this.applyStandardUser(u);
      }
      return;
    }
    if (this.selectedRole === 'Manager') {
      const mgr = this.managersForDept.find((m) => m.id === this.selectedManagerUserId) ?? this.managersForDept[0];
      const coach =
        this.coachesForManager.find((c) => c.id === this.selectedCoachScopeId) ?? this.coachesForManager[0];
      if (mgr && coach) {
        this.selectedManagerUserId = mgr.id;
        this.selectedCoachScopeId = coach.id;
        this.applyManagerContext(mgr, coach);
      }
      return;
    }
    if (this.selectedRole === 'RP') {
      const rp = this.rpUsersForDept.find((r) => r.id === this.selectedRpUserId) ?? this.rpUsersForDept[0];
      if (rp) {
        this.selectedRpUserId = rp.id;
        this.applyRpContext();
      }
    }
  }

  private applyStandardUser(user: DirectoryUserDto): void {
    this.identity.clearOrgScope();
    const tenantDefault =
      this.identity.getTenantId() ||
      environment.documentationUserContextHeaders?.[DocumentationHeaders.tenantId]?.trim() ||
      'atlas-tech-demo';
    this.identity.applyProfile(user);
    this.identity.setTenantId(tenantDefault);
    this.nav.setRole(mapApiRoleToDocumentationRole(user.role));
    this.identity.bumpContextRevision();
  }

  private applyManagerContext(manager: DirectoryUserDto, coach: DirectoryUserDto): void {
    const tenantDefault =
      this.identity.getTenantId() ||
      environment.documentationUserContextHeaders?.[DocumentationHeaders.tenantId]?.trim() ||
      'atlas-tech-demo';
    this.identity.applyProfile(manager);
    this.identity.setTenantId(tenantDefault);
    this.identity.setOrgScope(null, coach.id);
    this.nav.setRole('Manager');
    this.identity.bumpContextRevision();
  }

  private applyRpContext(): void {
    const rp = this.rpUsersForDept.find((u) => u.id === this.selectedRpUserId) ?? this.rpUsersForDept[0];
    if (!rp) {
      return;
    }
    const tenantDefault =
      this.identity.getTenantId() ||
      environment.documentationUserContextHeaders?.[DocumentationHeaders.tenantId]?.trim() ||
      'atlas-tech-demo';
    this.identity.applyProfile(rp);
    this.identity.setTenantId(tenantDefault);
    this.identity.setOrgScope(this.selectedRpScopeManagerId || null, this.selectedRpScopeCoachId || null);
    this.nav.setRole('RP');
    this.identity.bumpContextRevision();
  }
}
