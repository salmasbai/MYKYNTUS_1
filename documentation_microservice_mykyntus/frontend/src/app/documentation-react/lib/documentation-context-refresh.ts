import { merge, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';

/** Ré-exécute un observable à chaque changement d’utilisateur dev (en-têtes + profil). */
export function switchMapOnDocumentationContext<T>(
  identity: DocumentationIdentityService,
  project: () => Observable<T>,
): Observable<T> {
  return merge(of(null), identity.contextRevision$).pipe(switchMap(() => project()));
}
