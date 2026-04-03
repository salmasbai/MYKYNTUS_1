import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { DocumentationRole } from '../interfaces/documentation-role';
import type { AdminStorageConfig, AdminStorageType } from '../models/document-admin.models';
import { AdminShellComponent } from '../components/admin-shell/admin-shell.component';
import { AdminToggleComponent } from '../components/admin-toggle/admin-toggle.component';
import { DocumentAdminService } from '../services/document-admin.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';

function maskAccessKey(value: string): string {
  const v = value ?? '';
  if (v.length <= 8) return '********';
  return `${v.slice(0, 4)}****${v.slice(-4)}`;
}

@Component({
  standalone: true,
  selector: 'app-admin-storage-page',
  imports: [CommonModule, FormsModule, AdminShellComponent, AdminToggleComponent],
  templateUrl: './admin-storage-page.component.html',
})
export class AdminStoragePageComponent implements OnInit {
  readonly role$ = this.nav.role$;
  readonly storageTypes: AdminStorageType[] = ['Local', 'Cloud'];

  loading = true;
  draft: AdminStorageConfig | null = null;
  accessKeyInput = '';
  revealKey = false;
  saving = false;
  successMessage: string | null = null;
  errors: Record<string, string> = {};

  constructor(
    private readonly nav: DocumentationNavigationService,
    private readonly admin: DocumentAdminService
  ) {}

  ngOnInit(): void {
    void this.reload();
  }

  get maskedKey(): string {
    return this.draft ? maskAccessKey(this.draft.accessKey) : '';
  }

  async reload(): Promise<void> {
    const cfg = await this.admin.getStorageConfig();
    this.draft = cfg;
    this.accessKeyInput = '';
    this.revealKey = false;
    this.loading = false;
  }

  validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!this.draft) return e;
    if (!this.draft.apiUrl.trim()) e['apiUrl'] = 'URL API requise.';
    if (this.draft.storageType === 'Cloud') {
      if (!this.draft.bucketName.trim()) e['bucketName'] = 'Nom du bucket requis (Cloud).';
      if (!this.draft.region.trim()) e['region'] = 'Région requise (Cloud).';
    }
    return e;
  }

  async onSave(): Promise<void> {
    if (!this.draft) return;
    this.errors = {};
    this.successMessage = null;
    const e = this.validate();
    this.errors = e;
    if (Object.keys(e).length > 0) return;

    this.saving = true;
    try {
      const next: AdminStorageConfig = {
        ...this.draft,
        accessKey: this.accessKeyInput.trim() ? this.accessKeyInput.trim() : this.draft.accessKey,
      };
      await this.admin.saveStorageConfig(next);
      this.successMessage = 'Configuration de stockage sauvegardée.';
      this.loading = true;
      await this.reload();
    } finally {
      this.saving = false;
    }
  }

  async onReset(): Promise<void> {
    this.successMessage = null;
    this.errors = {};
    this.loading = true;
    try {
      await this.admin.resetStorageConfig();
      await this.reload();
    } finally {
      this.loading = false;
    }
  }

  isAdmin(role: DocumentationRole): boolean {
    return role === 'Admin';
  }

  patchDraft(partial: Partial<AdminStorageConfig>): void {
    if (!this.draft) return;
    this.draft = { ...this.draft, ...partial };
  }

  onStorageTypeChange(v: string): void {
    this.patchDraft({ storageType: v as AdminStorageType });
  }

  toggleReveal(): void {
    this.revealKey = !this.revealKey;
  }
}
