import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DocumentationHeaders } from '../constants/documentation-headers';
import type { DirectoryUserDto } from '../../shared/models/api.models';

const STORAGE_USER_ID = 'documentation-dev-user-id';
const STORAGE_USER_ROLE = 'documentation-dev-user-role';
const STORAGE_TENANT_ID = 'documentation-dev-tenant-id';
const STORAGE_PROFILE_JSON = 'documentation-dev-profile-json';
const STORAGE_SCOPE_MANAGER_ID = 'documentation-scope-manager-id';
const STORAGE_SCOPE_COACH_ID = 'documentation-scope-coach-id';

/**
 * Identité courante pour le microservice Documentation : en-têtes HTTP + profil annuaire (API).
 * En production, la gateway fournit les en-têtes ; le profil est chargé via GET .../users/me.
 */
@Injectable({ providedIn: 'root' })
export class DocumentationIdentityService {
  readonly profile$ = new BehaviorSubject<DirectoryUserDto | null>(null);
  readonly directoryUsers$ = new BehaviorSubject<DirectoryUserDto[]>([]);
  /** Périmètre organisationnel (manager / coach) pour en-têtes X-Scope-* — navigation hiérarchique. */
  readonly scopeManagerId$ = new BehaviorSubject<string | null>(null);
  readonly scopeCoachId$ = new BehaviorSubject<string | null>(null);
  /** Incrémenté quand l’utilisateur dev change — recharger listes / tableaux de bord. */
  readonly contextRevision$ = new BehaviorSubject(0);

  private userId = '';
  private roleHeader = '';
  private tenantId = '';
  private scopeManagerId = '';
  private scopeCoachId = '';

  hydrateFromStorage(): void {
    const env = environment.documentationUserContextHeaders ?? {};
    const profileRaw = localStorage.getItem(STORAGE_PROFILE_JSON);
    if (profileRaw) {
      try {
        const dto = JSON.parse(profileRaw) as DirectoryUserDto;
        if (dto?.id?.trim() && dto.role?.trim()) {
          this.userId = dto.id.trim();
          this.roleHeader = dto.role.trim().toLowerCase();
          this.profile$.next(dto);
          localStorage.setItem(STORAGE_USER_ID, this.userId);
          localStorage.setItem(STORAGE_USER_ROLE, this.roleHeader);
        }
      } catch {
        /* ignore JSON invalide */
      }
    }
    if (!this.userId) {
      this.userId = localStorage.getItem(STORAGE_USER_ID)?.trim() ?? env[DocumentationHeaders.userId]?.trim() ?? '';
    }
    if (!this.roleHeader) {
      this.roleHeader =
        localStorage.getItem(STORAGE_USER_ROLE)?.trim()?.toLowerCase() ??
        env[DocumentationHeaders.userRole]?.trim()?.toLowerCase() ??
        '';
    }
    const tenantStored = localStorage.getItem(STORAGE_TENANT_ID)?.trim();
    this.tenantId = tenantStored || env[DocumentationHeaders.tenantId]?.trim() || '';
    this.scopeManagerId = localStorage.getItem(STORAGE_SCOPE_MANAGER_ID)?.trim() ?? '';
    this.scopeCoachId = localStorage.getItem(STORAGE_SCOPE_COACH_ID)?.trim() ?? '';
    this.scopeManagerId$.next(this.scopeManagerId || null);
    this.scopeCoachId$.next(this.scopeCoachId || null);
  }

  /** Carte à fusionner sur les requêtes vers /api/documentation/data */
  getHeaderMap(): Record<string, string> {
    const m: Record<string, string> = {};
    if (this.userId) {
      m[DocumentationHeaders.userId] = this.userId;
    }
    if (this.roleHeader) {
      m[DocumentationHeaders.userRole] = this.roleHeader;
    }
    if (this.tenantId) {
      m[DocumentationHeaders.tenantId] = this.tenantId;
    }
    if (this.scopeManagerId) {
      m[DocumentationHeaders.scopeManagerId] = this.scopeManagerId;
    }
    if (this.scopeCoachId) {
      m[DocumentationHeaders.scopeCoachId] = this.scopeCoachId;
    }
    return m;
  }

  getCurrentUserId(): string {
    return this.userId;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  /** Mode dev : persiste le tenant pour les en-têtes X-Tenant-Id. */
  setTenantId(tenantId: string): void {
    this.tenantId = tenantId.trim();
    if (this.tenantId) {
      localStorage.setItem(STORAGE_TENANT_ID, this.tenantId);
    } else {
      localStorage.removeItem(STORAGE_TENANT_ID);
    }
  }

  setDirectoryUsers(users: DirectoryUserDto[]): void {
    this.directoryUsers$.next(users);
  }

  /**
   * Périmètre hiérarchique pour les rôles manager / RP (filtre côté API des demandes pilotes).
   * @param managerId UUID manager d’agence (RP : premier filtre)
   * @param coachId UUID coach (filtre des demandes des pilotes rattachés à ce coach)
   */
  setOrgScope(managerId: string | null, coachId: string | null): void {
    this.scopeManagerId = managerId?.trim() ?? '';
    this.scopeCoachId = coachId?.trim() ?? '';
    if (this.scopeManagerId) {
      localStorage.setItem(STORAGE_SCOPE_MANAGER_ID, this.scopeManagerId);
    } else {
      localStorage.removeItem(STORAGE_SCOPE_MANAGER_ID);
    }
    if (this.scopeCoachId) {
      localStorage.setItem(STORAGE_SCOPE_COACH_ID, this.scopeCoachId);
    } else {
      localStorage.removeItem(STORAGE_SCOPE_COACH_ID);
    }
    this.scopeManagerId$.next(this.scopeManagerId || null);
    this.scopeCoachId$.next(this.scopeCoachId || null);
  }

  clearOrgScope(): void {
    this.setOrgScope(null, null);
  }

  /** Après GET /users/me — met à jour stockage, en-têtes futurs et profil affiché. */
  applyProfile(dto: DirectoryUserDto): void {
    this.userId = dto.id;
    this.roleHeader = dto.role.trim().toLowerCase();
    localStorage.setItem(STORAGE_USER_ID, this.userId);
    localStorage.setItem(STORAGE_USER_ROLE, this.roleHeader);
    try {
      localStorage.setItem(STORAGE_PROFILE_JSON, JSON.stringify(dto));
    } catch {
      /* quota / mode privé */
    }
    this.profile$.next(dto);
  }

  /**
   * Mode dev : changement d’utilisateur depuis la liste annuaire.
   * Ne déclenche pas la navigation — le composant appelle DocumentationNavigationService.setRole si besoin.
   */
  selectDevUser(dto: DirectoryUserDto): void {
    this.applyProfile(dto);
    this.bumpContextRevision();
  }

  /** Après chargement du profil serveur (ex. shell) : réaligne les écrans sur l’annuaire. */
  bumpContextRevision(): void {
    this.contextRevision$.next(this.contextRevision$.value + 1);
  }
}

export function documentationIdentityInitFactory(id: DocumentationIdentityService): () => Promise<void> {
  return () => {
    id.hydrateFromStorage();
    return Promise.resolve();
  };
}
