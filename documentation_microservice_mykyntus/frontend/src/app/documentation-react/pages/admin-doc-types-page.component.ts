import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { DocumentationRole } from '../interfaces/documentation-role';
import type { AdminDocType } from '../models/document-admin.models';
import type { AdminWorkflowDefinition } from '../models/document-admin.models';
import { AdminModalComponent } from '../components/admin-modal/admin-modal.component';
import { AdminShellComponent } from '../components/admin-shell/admin-shell.component';
import { AdminToggleComponent } from '../components/admin-toggle/admin-toggle.component';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';
import { DocumentAdminService } from '../services/document-admin.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';

type DocTypeForm = Omit<AdminDocType, 'id'>;

function maskBoolean(value: boolean): string {
  return value ? 'Obligatoire' : 'Optionnel';
}

@Component({
  standalone: true,
  selector: 'app-admin-doc-types-page',
  imports: [
    CommonModule,
    FormsModule,
    AdminShellComponent,
    AdminModalComponent,
    AdminToggleComponent,
    DocIconComponent,
  ],
  templateUrl: './admin-doc-types-page.component.html',
})
export class AdminDocTypesPageComponent implements OnInit {
  readonly role$ = this.nav.role$;
  readonly maskBoolean = maskBoolean;

  loading = true;
  docTypes: AdminDocType[] = [];
  workflows: AdminWorkflowDefinition[] = [];

  modalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  editingId: string | null = null;
  form: DocTypeForm = {
    name: '',
    code: '',
    description: '',
    department: '',
    retentionDays: 0,
    workflowId: '',
    mandatory: false,
  };
  formErrors: Record<string, string> = {};
  saving = false;
  successMessage: string | null = null;

  constructor(
    private readonly nav: DocumentationNavigationService,
    private readonly admin: DocumentAdminService
  ) {}

  ngOnInit(): void {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await this.reload();
    this.loading = false;
  }

  workflowLabel(id: string): string {
    return this.workflows.find((w) => w.id === id)?.name ?? id;
  }

  async reload(): Promise<void> {
    const [types, defs] = await Promise.all([this.admin.getDocTypes(), this.admin.getWorkflowDefinitions()]);
    this.docTypes = types;
    this.workflows = defs;
  }

  isAdmin(role: DocumentationRole): boolean {
    return role === 'Admin';
  }

  openCreate(): void {
    this.modalMode = 'create';
    this.editingId = null;
    this.form = {
      name: '',
      code: '',
      description: '',
      department: '',
      retentionDays: 0,
      workflowId: this.workflows[0]?.id ?? '',
      mandatory: false,
    };
    this.formErrors = {};
    this.successMessage = null;
    this.modalOpen = true;
  }

  openEdit(type: AdminDocType): void {
    this.modalMode = 'edit';
    this.editingId = type.id;
    this.form = {
      name: type.name,
      code: type.code,
      description: type.description,
      department: type.department,
      retentionDays: type.retentionDays,
      workflowId: type.workflowId,
      mandatory: type.mandatory,
    };
    this.formErrors = {};
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  validateForm(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!this.form.name.trim()) e['name'] = 'Nom requis.';
    if (!this.form.code.trim()) e['code'] = 'Code requis.';
    if (!this.form.department.trim()) e['department'] = 'Département requis.';
    if (!this.form.workflowId.trim()) e['workflowId'] = 'Workflow requis.';
    if (Number.isNaN(this.form.retentionDays) || this.form.retentionDays < 0) e['retentionDays'] = 'Durée invalide.';
    return e;
  }

  async onSubmit(): Promise<void> {
    this.successMessage = null;
    const e = this.validateForm();
    this.formErrors = e;
    if (Object.keys(e).length > 0) return;

    const wasCreate = this.modalMode === 'create';
    this.saving = true;
    try {
      if (this.modalMode === 'create') {
        await this.admin.createDocType(this.form);
      } else if (this.editingId) {
        await this.admin.updateDocType(this.editingId, this.form);
      }
      await this.reload();
      this.modalOpen = false;
      this.successMessage = wasCreate ? 'Type de document ajouté.' : 'Type de document mis à jour.';
    } finally {
      this.saving = false;
    }
  }

  async onDelete(id: string): Promise<void> {
    const ok = window.confirm('Supprimer ce type de document ? Cette action est irréversible.');
    if (!ok) return;
    await this.admin.deleteDocType(id);
    await this.reload();
    this.successMessage = 'Type de document supprimé.';
  }

  patchForm(partial: Partial<DocTypeForm>): void {
    this.form = { ...this.form, ...partial };
  }

  onCodeInput(v: string): void {
    this.form = { ...this.form, code: v.toUpperCase() };
  }
}
