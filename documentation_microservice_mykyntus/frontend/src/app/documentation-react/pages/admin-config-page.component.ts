import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { DocumentationRole } from '../interfaces/documentation-role';
import type { AdminGeneralConfig } from '../models/document-admin.models';
import { AdminShellComponent } from '../components/admin-shell/admin-shell.component';
import { AdminToggleComponent } from '../components/admin-toggle/admin-toggle.component';
import { DocumentAdminService } from '../services/document-admin.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';

function normalizeFileTypes(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

@Component({
  standalone: true,
  selector: 'app-admin-config-page',
  imports: [CommonModule, FormsModule, AdminShellComponent, AdminToggleComponent],
  templateUrl: './admin-config-page.component.html',
})
export class AdminConfigPageComponent implements OnInit {
  readonly role$ = this.nav.role$;

  loading = true;
  draft: AdminGeneralConfig | null = null;
  allowedTypesText = '';
  saving = false;
  successMessage: string | null = null;
  errors: Record<string, string> = {};

  constructor(
    private readonly nav: DocumentationNavigationService,
    private readonly admin: DocumentAdminService
  ) {}

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    const cfg = await this.admin.getGeneralConfig();
    this.draft = cfg;
    this.allowedTypesText = cfg.allowedFileTypes.join(', ');
    this.loading = false;
  }

  derivedAllowedTypes(): string[] {
    return normalizeFileTypes(this.allowedTypesText);
  }

  validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (!this.draft) return nextErrors;

    if (!this.draft.systemName.trim()) nextErrors['systemName'] = 'Nom du système requis.';
    if (Number.isNaN(this.draft.maxFileSizeMB) || this.draft.maxFileSizeMB <= 0) {
      nextErrors['maxFileSizeMB'] = 'Taille maximale doit être > 0.';
    }
    if (this.draft.retentionDays < 0) nextErrors['retentionDays'] = "Durée d'archivage ne peut pas être négative.";

    if (this.derivedAllowedTypes().length === 0)
      nextErrors['allowedFileTypes'] = 'Définissez au moins un type de fichier (ex: pdf, docx).';

    if (this.draft.autoNumberingEnabled && !this.draft.numberingPattern.trim()) {
      nextErrors['numberingPattern'] = 'Motif de numérotation requis si la numérotation est activée.';
    }

    return nextErrors;
  }

  async onSave(): Promise<void> {
    if (!this.draft) return;
    this.successMessage = null;
    const nextErrors = this.validate();
    this.errors = nextErrors;
    if (Object.keys(nextErrors).length > 0) return;

    this.saving = true;
    try {
      const next: AdminGeneralConfig = {
        ...this.draft,
        allowedFileTypes: this.derivedAllowedTypes(),
      };
      await this.admin.saveGeneralConfig(next);
      this.draft = next;
      this.successMessage = 'Configuration sauvegardée.';
    } finally {
      this.saving = false;
    }
  }

  async onReset(): Promise<void> {
    this.successMessage = null;
    this.errors = {};
    this.loading = true;
    try {
      const cfg = await this.admin.resetGeneralConfig();
      this.draft = cfg;
      this.allowedTypesText = cfg.allowedFileTypes.join(', ');
    } finally {
      this.loading = false;
    }
  }

  isAdmin(role: DocumentationRole): boolean {
    return role === 'Admin';
  }

  patchDraft(partial: Partial<AdminGeneralConfig>): void {
    if (!this.draft) return;
    this.draft = { ...this.draft, ...partial };
  }

  patchSecurity(partial: Partial<AdminGeneralConfig['security']>): void {
    if (!this.draft) return;
    this.draft = { ...this.draft, security: { ...this.draft.security, ...partial } };
  }

  patchNotifications(partial: Partial<AdminGeneralConfig['notifications']>): void {
    if (!this.draft) return;
    this.draft = { ...this.draft, notifications: { ...this.draft.notifications, ...partial } };
  }

  num(value: unknown): number {
    return Number(value);
  }
}
