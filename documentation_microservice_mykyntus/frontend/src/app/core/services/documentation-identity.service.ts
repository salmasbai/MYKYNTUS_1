import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DocumentationHeaders } from '../constants/documentation-headers';
import type { DirectoryUserDto } from '../../shared/models/api.models';

const STORAGE_USER_ID = 'documentation-dev-user-id';
const STORAGE_USER_ROLE = 'documentation-dev-user-role';

/**
 * Identité courante pour le microservice Documentation : en-têtes HTTP + profil annuaire (API).
 * En production, la gateway fournit les en-têtes ; le profil est chargé via GET .../users/me.
 */
@Injectable({ providedIn: 'root' })
export class DocumentationIdentityService {
  readonly profile$ = new BehaviorSubject<DirectoryUserDto | null>(null);
  readonly directoryUsers$ = new BehaviorSubject<DirectoryUserDto[]>([]);
  /** Incrémenté quand l’utilisateur dev change — recharger listes / tableaux de bord. */
  readonly contextRevision$ = new BehaviorSubject(0);

  private userId = '';
  private roleHeader = '';
  private tenantId = '';

  hydrateFromStorage(): void {
    const env = environment.documentationUserContextHeaders ?? {};
    const uid = localStorage.getItem(STORAGE_USER_ID)?.trim() ?? env[DocumentationHeaders.userId]?.trim() ?? '';
    const r =
      localStorage.getItem(STORAGE_USER_ROLE)?.trim()?.toLowerCase() ??
      env[DocumentationHeaders.userRole]?.trim()?.toLowerCase() ??
      '';
    const tenant = env[DocumentationHeaders.tenantId]?.trim() ?? '';
    this.userId = uid;
    this.roleHeader = r;
    this.tenantId = tenant;
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
    return m;
  }

  getCurrentUserId(): string {
    return this.userId;
  }

  setDirectoryUsers(users: DirectoryUserDto[]): void {
    this.directoryUsers$.next(users);
  }

  /** Après GET /users/me — met à jour stockage, en-têtes futurs et profil affiché. */
  applyProfile(dto: DirectoryUserDto): void {
    this.userId = dto.id;
    this.roleHeader = dto.role.trim().toLowerCase();
    localStorage.setItem(STORAGE_USER_ID, this.userId);
    localStorage.setItem(STORAGE_USER_ROLE, this.roleHeader);
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
