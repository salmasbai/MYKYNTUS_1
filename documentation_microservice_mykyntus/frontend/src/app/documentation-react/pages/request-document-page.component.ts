import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DocIconComponent } from '../components/doc-icon/doc-icon.component';

const OTHER_DOC_TYPE = 'Autre';

@Component({
  standalone: true,
  selector: 'app-request-document-page',
  imports: [CommonModule, FormsModule, DocIconComponent],
  templateUrl: './request-document-page.component.html',
})
export class RequestDocumentPageComponent {
  readonly OTHER = OTHER_DOC_TYPE;
  submitted = false;
  documentType = 'Attestation de travail';
  otherDescription = '';
  otherDescriptionError = false;

  handleSubmit(ev: Event): void {
    ev.preventDefault();
    if (this.documentType === OTHER_DOC_TYPE) {
      const trimmed = this.otherDescription.trim();
      if (!trimmed) {
        this.otherDescriptionError = true;
        return;
      }
      this.otherDescriptionError = false;
    }
    this.submitted = true;
    window.setTimeout(() => {
      this.submitted = false;
    }, 3000);
  }

  onDocTypeChange(value: string): void {
    this.documentType = value;
    this.otherDescriptionError = false;
    if (value !== OTHER_DOC_TYPE) {
      this.otherDescription = '';
    }
  }
}
