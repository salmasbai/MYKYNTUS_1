import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DocumentationToastKind = 'error' | 'success';

export interface DocumentationToast {
  readonly text: string;
  readonly kind: DocumentationToastKind;
}

@Injectable({ providedIn: 'root' })
export class DocumentationNotificationService {
  private readonly toastSubject = new BehaviorSubject<DocumentationToast | null>(null);
  readonly toast$ = this.toastSubject.asObservable();

  showError(text: string): void {
    this.toastSubject.next({ text, kind: 'error' });
  }

  showSuccess(text: string): void {
    this.toastSubject.next({ text, kind: 'success' });
  }

  clear(): void {
    this.toastSubject.next(null);
  }
}
