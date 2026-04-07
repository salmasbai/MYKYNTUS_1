import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { DocumentationHeaders } from '../constants/documentation-headers';
import { DocumentationIdentityService } from './documentation-identity.service';

export interface DevContextSnapshot {
  userId: string;
  roleApi: string;
  tenantId: string;
  displayName: string;
}

/**
 * Vue agrégée du contexte dev (identité + en-têtes) pour l’UI et les tests.
 * Le stockage et les en-têtes HTTP restent dans {@link DocumentationIdentityService}.
 */
@Injectable({ providedIn: 'root' })
export class DevContextService {
  readonly enabled = !environment.production && environment.documentationDevToolsEnabled;

  readonly context$: Observable<DevContextSnapshot> = combineLatest([
    this.identity.profile$,
    this.identity.contextRevision$,
  ]).pipe(map(() => this.snapshot()));

  constructor(private readonly identity: DocumentationIdentityService) {}

  private snapshot(): DevContextSnapshot {
    const h = this.identity.getHeaderMap();
    const p = this.identity.profile$.value;
    const displayName = p ? `${p.prenom ?? ''} ${p.nom ?? ''}`.trim() : '';
    return {
      userId: h[DocumentationHeaders.userId] ?? '',
      roleApi: h[DocumentationHeaders.userRole] ?? '',
      tenantId: h[DocumentationHeaders.tenantId] ?? '',
      displayName,
    };
  }
}
