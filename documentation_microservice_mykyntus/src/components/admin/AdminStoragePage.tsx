import React, { useEffect, useMemo, useState } from 'react';
import { Role } from '../../types';
import { ICONS } from '../../types';
import { AdminStorageConfig, AdminStorageType } from '../../adminDocumentation/documentAdminModels';
import {
  getStorageConfig,
  resetStorageConfig,
  saveStorageConfig,
} from '../../adminDocumentation/documentAdminService';
import { AdminShell } from './AdminShell';
import { AdminToggle } from './AdminToggle';

function maskAccessKey(value: string) {
  const v = value ?? '';
  if (v.length <= 8) return '********';
  return `${v.slice(0, 4)}****${v.slice(-4)}`;
}

export const AdminStoragePage: React.FC<{ role: Role }> = ({ role }) => {
  const isAdmin = role === 'Admin';

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<AdminStorageConfig | null>(null);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [revealKey, setRevealKey] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const storageTypes: AdminStorageType[] = useMemo(() => ['Local', 'Cloud'], []);

  const reload = async () => {
    const cfg = await getStorageConfig();
    setDraft(cfg);
    setAccessKeyInput('');
    setRevealKey(false);
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

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!draft) return e;

    if (!draft.apiUrl.trim()) e.apiUrl = "URL API requise.";
    if (draft.storageType === 'Cloud') {
      if (!draft.bucketName.trim()) e.bucketName = "Nom du bucket requis (Cloud).";
      if (!draft.region.trim()) e.region = 'Région requise (Cloud).';
    }
    return e;
  };

  const onSave = async () => {
    if (!draft) return;
    setErrors({});
    setSuccessMessage(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const next: AdminStorageConfig = {
        ...draft,
        accessKey: accessKeyInput.trim() ? accessKeyInput.trim() : draft.accessKey,
      };
      await saveStorageConfig(next);
      setSuccessMessage('Configuration de stockage sauvegardée.');
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    setSuccessMessage(null);
    setErrors({});
    setLoading(true);
    try {
      await resetStorageConfig();
      await reload();
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <AdminShell title="Storage Configuration" description="Accès refusé pour ce rôle." icon={ICONS.Storage}>
        <div className="card-navy p-6">
          <p className="text-slate-300">Seul le rôle `Admin` peut modifier la configuration de stockage.</p>
        </div>
      </AdminShell>
    );
  }

  if (loading || !draft) {
    return (
      <AdminShell title="Storage Configuration" description="Chargement de la configuration…" icon={ICONS.Storage}>
        <div className="card-navy p-6">
          <p className="text-slate-300">Veuillez patienter.</p>
        </div>
      </AdminShell>
    );
  }

  const maskedKey = maskAccessKey(draft.accessKey);

  return (
    <AdminShell
      title="Configuration du stockage"
      description="Définissez le type de stockage (Local/Cloud), les endpoints et les options DMS"
      icon={ICONS.Storage}
    >
      <div className="card-navy p-6 space-y-6">
        {successMessage && (
          <div className="px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <h4 className="text-white font-bold text-lg">{draft.storageType} storage</h4>
            <p className="text-sm text-slate-500 mt-1">Les secrets sont stockés côté service/mock, affichés masqués en UI.</p>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-white">Type de stockage</label>
              <select
                value={draft.storageType}
                onChange={(e) => setDraft({ ...draft, storageType: e.target.value as AdminStorageType })}
                className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
              >
                {storageTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-white">URL API</label>
              <input
                value={draft.apiUrl}
                onChange={(e) => setDraft({ ...draft, apiUrl: e.target.value })}
                className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
              />
              {errors.apiUrl && <p className="text-xs text-red-400 mt-1">{errors.apiUrl}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-white">Nom du bucket</label>
              <input
                value={draft.bucketName}
                onChange={(e) => setDraft({ ...draft, bucketName: e.target.value })}
                disabled={draft.storageType !== 'Cloud'}
                className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500 disabled:opacity-60"
              />
              {errors.bucketName && <p className="text-xs text-red-400 mt-1">{errors.bucketName}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-white">Région</label>
              <input
                value={draft.region}
                onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                disabled={draft.storageType !== 'Cloud'}
                className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500 disabled:opacity-60"
              />
              {errors.region && <p className="text-xs text-red-400 mt-1">{errors.region}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-navy-800 rounded-xl p-4 bg-navy-900/30">
              <h4 className="text-sm font-bold text-white">Clé d’accès</h4>
              <p className="text-xs text-slate-500 mt-1">
                Affichage masqué en UI. Pour remplacer le secret, saisissez une nouvelle valeur.
              </p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="text-sm text-slate-200">
                  Secret actuel: <span className="font-mono text-slate-100">{revealKey ? draft.accessKey : maskedKey}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRevealKey((v) => !v)}
                  className="px-3 py-2 text-xs font-semibold text-blue-500 hover:text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 rounded-lg transition-all"
                >
                  {revealKey ? 'Masquer' : 'Révéler'}
                </button>
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-white">Nouveau secret (optionnel)</label>
                <input
                  type="password"
                  value={accessKeyInput}
                  onChange={(e) => setAccessKeyInput(e.target.value)}
                  placeholder="******"
                  className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Laisser vide conserve la valeur actuelle (mock).
                </p>
              </div>
            </div>

            <div className="border border-navy-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">Options</h4>
              <div className="space-y-3">
                <AdminToggle
                  checked={draft.backupEnabled}
                  onChange={(next) => setDraft({ ...draft, backupEnabled: next })}
                  label="Activer backup"
                />
                <AdminToggle
                  checked={draft.compressionEnabled}
                  onChange={(next) => setDraft({ ...draft, compressionEnabled: next })}
                  label="Activer compression"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

