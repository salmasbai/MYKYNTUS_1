import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import type { DocumentationRole } from '../interfaces/documentation-role';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';

@Component({
  standalone: true,
  selector: 'app-doc-gen-page',
  imports: [CommonModule, DocIconComponent],
  templateUrl: './doc-gen-page.component.html',
})
export class DocGenPageComponent {
  readonly role$ = this.nav.role$;

  constructor(private readonly nav: DocumentationNavigationService) {}

  canGenerate(role: DocumentationRole): boolean {
    return role === 'RH' || role === 'Admin';
  }
}
