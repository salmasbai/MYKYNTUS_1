import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AuditInterfaceSectionId =
  | 'dashboard'
  | 'journal'
  | 'access-history'
  | 'anomalies'
  | 'reporting';

@Injectable({ providedIn: 'root' })
export class AuditInterfaceNavService {
  private readonly sectionSubject = new BehaviorSubject<AuditInterfaceSectionId>('journal');
  readonly section$ = this.sectionSubject.asObservable();

  get section(): AuditInterfaceSectionId {
    return this.sectionSubject.value;
  }

  setSection(s: AuditInterfaceSectionId): void {
    this.sectionSubject.next(s);
  }
}
