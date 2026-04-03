import React, { useEffect, useMemo, useState } from 'react';
import { Role } from '../../types';
import { ICONS } from '../../types';
import {
  AdminDocType,
  AdminWorkflowDefinition,
} from '../../adminDocumentation/documentAdminModels';
import {
  createDocType,
  deleteDocType,
  getDocTypes,
  getWorkflowDefinitions,
  updateDocType,
} from '../../adminDocumentation/documentAdminService';
import { AdminShell } from './AdminShell';
import { AdminModal } from './AdminModal';
import { AdminToggle } from './AdminToggle';

type DocTypeForm = Omit<AdminDocType, 'id'>;

function maskBoolean(value: boolean) {
  return value ? 'Obligatoire' : 'Optionnel';
}

export const AdminDocTypesPage: React.FC<{ role: Role }> = ({ role }) => {
  const isAdmin = role === 'Admin';

  const [loading, setLoading] = useState(true);
  const [docTypes, setDocTypes] = useState<AdminDocType[]>([]);
  const [workflows, setWorkflows] = useState<AdminWorkflowDefinition[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DocTypeForm>({
    name: '',
    code: '',
    description: '',
    department: '',
    retentionDays: 0,
    workflowId: '',
    mandatory: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const workflowLabelById = useMemo(() => {
    const map = new Map<string, string>();
    workflows.forEach((w) => map.set(w.id, w.name));
    return map;
  }, [workflows]);

  const reload = async () => {
    const [types, defs] = await Promise.all([getDocTypes(), getWorkflowDefinitions()]);
    setDocTypes(types);
    setWorkflows(defs);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await reload();
      if (!mounted) return;
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const openCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setForm({
      name: '',
      code: '',
      description: '',
      department: '',
      retentionDays: 0,
      workflowId: workflows[0]?.id ?? '',
      mandatory: false,
    });
    setFormErrors({});
    setSuccessMessage(null);
    setModalOpen(true);
  };

  const openEdit = (type: AdminDocType) => {
    setModalMode('edit');
    setEditingId(type.id);
    setForm({
      name: type.name,
      code: type.code,
      description: type.description,
      department: type.department,
      retentionDays: type.retentionDays,
      workflowId: type.workflowId,
      mandatory: type.mandatory,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nom requis.';
    if (!form.code.trim()) e.code = 'Code requis.';
    if (!form.department.trim()) e.department = 'Département requis.';
    if (!form.workflowId.trim()) e.workflowId = 'Workflow requis.';
    if (Number.isNaN(form.retentionDays) || form.retentionDays < 0) e.retentionDays = 'Durée invalide.';
    return e;
  };

  const onSubmit = async () => {
    setSuccessMessage(null);
    const e = validateForm();
    setFormErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      if (modalMode === 'create') {
        await createDocType(form);
      } else if (editingId) {
        await updateDocType(editingId, form);
      }
      await reload();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
    setSuccessMessage(modalMode === 'create' ? 'Type de document ajouté.' : 'Type de document mis à jour.');
  };

  const onDelete = async (id: string) => {
    const ok = window.confirm('Supprimer ce type de document ? Cette action est irréversible (mock).');
    if (!ok) return;
    await deleteDocType(id);
    await reload();
    setSuccessMessage('Type de document supprimé.');
  };

  if (!isAdmin) {
    return (
      <AdminShell title="Document Types" description="Accès refusé pour ce rôle." icon={ICONS.Types}>
        <div className="card-navy p-6">
          <p className="text-slate-300">Seul le rôle `Admin` peut gérer les types de documents.</p>
        </div>
      </AdminShell>
    );
  }

  if (loading) {
    return (
      <AdminShell title="Document Types" description="Chargement des types…" icon={ICONS.Types}>
        <div className="card-navy p-6">
          <p className="text-slate-300">Veuillez patienter.</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Gestion des types de documents" description="CRUD complet, association au workflow et règles d’obligation" icon={ICONS.Types}>
      <div className="card-navy p-6 space-y-6">
        {successMessage && (
          <div className="px-4 py-3 rounded-lg bg-blue-500/10 text-blue-200 border border-blue-500/20">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="text-white font-bold text-lg">Types configurés</h4>
            <p className="text-sm text-slate-500 mt-1">Définissez vos catégories et leurs politiques de conservation.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            <ICONS.PlusCircle className="w-4 h-4" />
            Ajouter un type
          </button>
        </div>

        <div className="card-navy p-0 overflow-hidden border border-navy-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/40 border-b border-navy-800">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Département</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Durée (jours)</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Workflow</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Obligatoire</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {docTypes.map((dt) => (
                <tr key={dt.id} className="hover:bg-navy-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-200">{dt.name}</div>
                    {dt.description && <div className="text-xs text-slate-500 mt-1">{dt.description}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{dt.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{dt.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{dt.retentionDays}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{workflowLabelById.get(dt.workflowId) ?? dt.workflowId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${dt.mandatory ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-slate-500/10 text-slate-300 border-slate-500/20'}`}>
                      {maskBoolean(dt.mandatory)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(dt)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <ICONS.Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(dt.id)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <ICONS.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {docTypes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    Aucun type de document configuré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        open={modalOpen}
        title={modalMode === 'create' ? 'Ajouter un type de document' : 'Modifier le type de document'}
        description="CRUD complet avec association au workflow et règle d’obligation."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => setModalOpen(false)}
              className="px-6 py-3 rounded-lg font-bold text-slate-200 border border-navy-800 hover:bg-navy-800/50 transition-all"
              disabled={saving}
              type="button"
            >
              Annuler
            </button>
            <button
              onClick={onSubmit}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                saving ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'
              }`}
              disabled={saving}
              type="button"
            >
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-white">Nom</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
            />
            {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-white">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
            />
            {formErrors.code && <p className="text-xs text-red-400 mt-1">{formErrors.code}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-white">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-white">Département</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
            />
            {formErrors.department && <p className="text-xs text-red-400 mt-1">{formErrors.department}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-white">Durée de conservation (jours)</label>
            <input
              type="number"
              min={0}
              value={form.retentionDays}
              onChange={(e) => setForm({ ...form, retentionDays: Number(e.target.value) })}
              className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
            />
            {formErrors.retentionDays && <p className="text-xs text-red-400 mt-1">{formErrors.retentionDays}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-white">Workflow associé</label>
            <select
              value={form.workflowId}
              onChange={(e) => setForm({ ...form, workflowId: e.target.value })}
              className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
            >
              {workflows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {formErrors.workflowId && <p className="text-xs text-red-400 mt-1">{formErrors.workflowId}</p>}
          </div>
          <div className="md:col-span-1">
            <div className="mt-8">
              <AdminToggle
                checked={form.mandatory}
                onChange={(next) => setForm({ ...form, mandatory: next })}
                label="Obligatoire"
              />
            </div>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
};

