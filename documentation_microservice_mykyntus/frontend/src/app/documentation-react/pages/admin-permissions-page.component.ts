import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { DocumentationRole } from '../interfaces/documentation-role';
import type {
  AdminDocType,
  AdminPermissionPolicy,
  AdminPermissionSet,
  AdminRole,
} from '../models/document-admin.models';
import { AdminShellComponent } from '../components/admin-shell/admin-shell.component';
import { AdminToggleComponent } from '../components/admin-toggle/admin-toggle.component';
import { DocumentAdminService } from '../services/document-admin.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';

type FilterValue = 'ALL' | string;

const permissionKeys: (keyof AdminPermissionSet)[] = ['read', 'create', 'update', 'delete', 'validate'];

const permissionLabels: Record<keyof AdminPermissionSet, string> = {
  read: 'Lire',
  create: 'Créer',
  update: 'Modifier',
  delete: 'Supprimer',
  validate: 'Valider',
};

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function resolvePermissionsForSelection(params: {
  role: AdminRole;
  docTypeIdOpt?: string;
  departmentOpt?: string;
  policies: AdminPermissionPolicy[];
}): AdminPermissionSet {
  const { role, docTypeIdOpt, departmentOpt, policies } = params;

  const find = (docTypeId?: string, department?: string) =>
    policies.find((p) => p.role === role && p.docTypeId === docTypeId && p.department === department)?.permissions;

  return (
    find(docTypeIdOpt, departmentOpt) ??
    find(docTypeIdOpt, undefined) ??
    find(undefined, departmentOpt) ??
    find(undefined, undefined) ?? {
      read: false,
      create: false,
      update: false,
      delete: false,
      validate: false,
    }
  );
}

function upsertPolicy(params: {
  policies: AdminPermissionPolicy[];
  role: AdminRole;
  docTypeIdOpt?: string;
  departmentOpt?: string;
  permissions: AdminPermissionSet;
}): AdminPermissionPolicy[] {
  const { policies, role, docTypeIdOpt, departmentOpt, permissions } = params;

  const idx = policies.findIndex(
    (p) => p.role === role && p.docTypeId === docTypeIdOpt && p.department === departmentOpt
  );

  if (idx !== -1) {
    return policies.map((p, i) => (i === idx ? { ...p, permissions } : p));
  }

  const newPolicy: AdminPermissionPolicy = {
    id: `p-${role}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    role,
    docTypeId: docTypeIdOpt,
    department: departmentOpt,
    permissions,
  };

  return [newPolicy, ...policies];
}

@Component({
  standalone: true,
  selector: 'app-admin-permissions-page',
  imports: [CommonModule, FormsModule, AdminShellComponent, AdminToggleComponent],
  templateUrl: './admin-permissions-page.component.html',
})
export class AdminPermissionsPageComponent implements OnInit {
  readonly role$ = this.nav.role$;
  readonly permissionKeys = permissionKeys;
  readonly permissionLabels = permissionLabels;
  adminRoles: AdminRole[] = [];

  loading = true;
  docTypes: AdminDocType[] = [];
  policiesDraft: AdminPermissionPolicy[] = [];

  selectedDocType: FilterValue = 'ALL';
  selectedDepartment: FilterValue = 'ALL';

  saving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private readonly nav: DocumentationNavigationService,
    private readonly admin: DocumentAdminService
  ) {}

  ngOnInit(): void {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    try {
      await this.reload();
    } finally {
      this.loading = false;
    }
  }

  get departments(): string[] {
    const set = new Set<string>();
    this.docTypes.forEach((d) => set.add(d.department));
    return Array.from(set).sort();
  }

  docTypeLabel(id: string): string {
    return this.docTypes.find((d) => d.id === id)?.name ?? id;
  }

  get docTypeIdOpt(): string | undefined {
    return this.selectedDocType === 'ALL' ? undefined : this.selectedDocType;
  }

  get departmentOpt(): string | undefined {
    return this.selectedDepartment === 'ALL' ? undefined : this.selectedDepartment;
  }

  resolvedForRole(role: AdminRole): AdminPermissionSet {
    return resolvePermissionsForSelection({
      role,
      docTypeIdOpt: this.docTypeIdOpt,
      departmentOpt: this.departmentOpt,
      policies: this.policiesDraft,
    });
  }

  isAdmin(role: DocumentationRole): boolean {
    return role === 'Admin';
  }

  async reload(): Promise<void> {
    const [types, policies, roles] = await Promise.all([
      this.admin.getDocTypes(),
      this.admin.getPermissionPolicies(),
      this.admin.getAdminRoles(),
    ]);
    this.docTypes = types;
    this.policiesDraft = policies;
    this.adminRoles = roles;
  }

  onToggle(roleKey: AdminRole, permKey: keyof AdminPermissionSet, nextVal: boolean): void {
    const resolved = this.resolvedForRole(roleKey);
    const nextSet: AdminPermissionSet = { ...resolved, [permKey]: nextVal };
    this.policiesDraft = upsertPolicy({
      policies: deepCopy(this.policiesDraft),
      role: roleKey,
      docTypeIdOpt: this.docTypeIdOpt,
      departmentOpt: this.departmentOpt,
      permissions: nextSet,
    });
    this.successMessage = null;
    this.errorMessage = null;
  }

  async onSave(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;
    this.saving = true;
    try {
      await this.admin.savePermissionPolicies(this.policiesDraft);
      this.successMessage = 'Permissions sauvegardées pour les règles affichées.';
    } catch {
      this.errorMessage = 'Échec de sauvegarde côté serveur.';
    } finally {
      this.saving = false;
    }
  }

  async onReset(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;
    try {
      await this.admin.resetPermissionPolicies();
      await this.reload();
    } finally {
      this.loading = false;
    }
  }

  filterSummaryDocType(): string {
    return this.selectedDocType === 'ALL' ? 'Tous les types' : this.docTypeLabel(this.selectedDocType);
  }

  filterSummaryDept(): string {
    return this.selectedDepartment === 'ALL' ? 'Tous les départements' : this.selectedDepartment;
  }
}