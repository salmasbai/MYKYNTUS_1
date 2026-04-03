import React, { useEffect, useMemo, useState } from 'react';
import { Role } from '../../types';
import { ICONS } from '../../types';
import {
  AdminPermissionPolicy,
  AdminPermissionSet,
  AdminDocType,
  AdminRole,
} from '../../adminDocumentation/documentAdminModels';
import {
  getDocTypes,
  getPermissionPolicies,
  getAdminRoles,
  resetPermissionPolicies,
  savePermissionPolicies,
} from '../../adminDocumentation/documentAdminService';
import { AdminShell } from './AdminShell';
import { AdminToggle } from './AdminToggle';

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
    policies.find(
      (p) => p.role === role && p.docTypeId === docTypeId && p.department === department
    )?.permissions;

  // Ordre de fallback pour éviter les trous dans les règles
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
    (p) =>
      p.role === role &&
      p.docTypeId === docTypeIdOpt &&
      p.department === departmentOpt
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

export const AdminPermissionsPage: React.FC<{ role: Role }> = ({ role }) => {
  const isAdmin = role === 'Admin';

  const [loading, setLoading] = useState(true);
  const [docTypes, setDocTypes] = useState<AdminDocType[]>([]);
  const [policiesDraft, setPoliciesDraft] = useState<AdminPermissionPolicy[]>([]);

  const [selectedDocType, setSelectedDocType] = useState<FilterValue>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<FilterValue>('ALL');

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const adminRoles = useMemo(() => getAdminRoles(), []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    docTypes.forEach((d) => set.add(d.department));
    return Array.from(set).sort();
  }, [docTypes]);

  const docTypeLabelById = useMemo(() => {
    const map = new Map<string, string>();
    docTypes.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [docTypes]);

  const reload = async () => {
    const [types, policies] = await Promise.all([getDocTypes(), getPermissionPolicies()]);
    setDocTypes(types);
    setPoliciesDraft(policies);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await reload();
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const docTypeIdOpt = selectedDocType === 'ALL' ? undefined : selectedDocType;
  const departmentOpt = selectedDepartment === 'ALL' ? undefined : selectedDepartment;

  const resolvedByRole = useMemo(() => {
    const map = new Map<AdminRole, AdminPermissionSet>();
    adminRoles.forEach((r) => {
      map.set(
        r,
        resolvePermissionsForSelection({
          role: r,
          docTypeIdOpt,
          departmentOpt,
          policies: policiesDraft,
        })
      );
    });
    return map;
  }, [adminRoles, docTypeIdOpt, departmentOpt, policiesDraft]);

  const onToggle = (roleKey: AdminRole, permKey: keyof AdminPermissionSet, nextVal: boolean) => {
    const resolved = resolvedByRole.get(roleKey);
    if (!resolved) return;

    const nextSet: AdminPermissionSet = { ...resolved, [permKey]: nextVal };
    const nextPolicies = upsertPolicy({
      policies: deepCopy(policiesDraft),
      role: roleKey,
      docTypeIdOpt,
      departmentOpt,
      permissions: nextSet,
    });
    setPoliciesDraft(nextPolicies);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const onSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);
    try {
      await savePermissionPolicies(policiesDraft);
      setSuccessMessage('Permissions sauvegardées pour les règles affichées.');
    } catch {
      setErrorMessage('Échec de sauvegarde (mock).');
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await resetPermissionPolicies();
      await reload();
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <AdminShell title="Permissions Management" description="Accès refusé pour ce rôle." icon={ICONS.Permissions}>
        <div className="card-navy p-6">
          <p className="text-slate-300">Seul le rôle `Admin` peut modifier la matrice RBAC.</p>
        </div>
      </AdminShell>
    );
  }

  if (loading) {
    return (
      <AdminShell title="Permissions Management" description="Chargement des permissions…" icon={ICONS.Permissions}>
        <div className="card-navy p-6">
          <p className="text-slate-300">Veuillez patienter.</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Gestion des permissions"
      description="Matrice RBAC filtrable par type de document et département"
      icon={ICONS.Permissions}
    >
      <div className="card-navy p-6 space-y-6">
        {successMessage && (
          <div className="px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-white">Filtrer par type</label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="ALL">Tous les types</option>
              {docTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-white">Filtrer par département</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="ALL">Tous les départements</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={onSave}
                disabled={saving}
                className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                  saving ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                }`}
                type="button"
              >
                {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
              <button
                onClick={onReset}
                disabled={saving}
                className="px-6 py-3 rounded-lg font-bold text-slate-200 border border-navy-800 hover:bg-navy-800/50 transition-all"
                type="button"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        <div className="border border-navy-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-navy-800/30 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-300">
              Règles actives: <span className="text-white font-semibold">{selectedDocType === 'ALL' ? 'Tous les types' : docTypeLabelById.get(selectedDocType) ?? selectedDocType}</span>
              {' '}•{' '}
              <span className="text-white font-semibold">{selectedDepartment === 'ALL' ? 'Tous les départements' : selectedDepartment}</span>
            </p>
            <div className="text-xs text-slate-500">
              Modifiez les cases à cocher puis cliquez sur <span className="text-slate-200 font-semibold">Sauvegarder</span>.
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/20 border-b border-navy-800">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Permission</th>
                {adminRoles.map((r) => (
                  <th key={r} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {permissionKeys.map((permKey) => (
                <tr key={permKey} className="hover:bg-navy-800/15 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-200 font-semibold">{permissionLabels[permKey]}</td>
                  {adminRoles.map((r) => {
                    const permSet = resolvedByRole.get(r);
                    const checked = permSet?.[permKey] ?? false;
                    return (
                      <td key={r + permKey} className="px-6 py-4">
                        <div className="flex items-center">
                          <AdminToggle
                            checked={checked}
                            onChange={(next) => onToggle(r, permKey, next)}
                            disabled={false}
                            title={`Modifier: ${permissionLabels[permKey]} pour ${r}`}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
};

