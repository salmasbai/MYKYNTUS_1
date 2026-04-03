import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import type { HierarchyDrillSelection } from '../lib/documentation-org-hierarchy';

@Injectable({ providedIn: 'root' })
export class DocumentationHierarchyDrillService {
  private readonly drillSubject = new BehaviorSubject<HierarchyDrillSelection>({});
  readonly drill$ = this.drillSubject.asObservable();

  get drill(): HierarchyDrillSelection {
    return this.drillSubject.value;
  }

  setManagerId(id: string | undefined): void {
    const d = this.drillSubject.value;
    this.drillSubject.next({ ...d, managerId: id, coachId: undefined });
  }

  setCoachId(id: string | undefined): void {
    const d = this.drillSubject.value;
    this.drillSubject.next({ ...d, coachId: id });
  }

  resetDrill(): void {
    this.drillSubject.next({});
  }
}
