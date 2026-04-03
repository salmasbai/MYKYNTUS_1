import React, { useEffect, useMemo, useState } from 'react';
import { Role } from '../../types';
import { ICONS } from '../../types';
import { AdminGeneralConfig } from '../../adminDocumentation/documentAdminModels';
import { getGeneralConfig, resetGeneralConfig, saveGeneralConfig } from '../../adminDocumentation/documentAdminService';
import { AdminShell } from './AdminShell';
import { AdminToggle } from './AdminToggle';

function normalizeFileTypes(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const AdminConfigurationPage: React.FC<{ role: Role }> = ({ role }) => {
  const isAdmin = role === 'Admin';

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<AdminGeneralConfig | null>(null);
  const [allowedTypesText, setAllowedTypesText] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const cfg = await getGeneralConfig();
      if (!mounted) return;
      setDraft(cfg);
      setAllowedTypesText(cfg.allowedFileTypes.join(', '));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const derivedAllowedTypes = useMemo(
    () => normalizeFileTypes(allowedTypesText),
    [allowedTypesText]
  );

  const validate = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    if (!draft) return nextErrors;

    if (!draft.systemName.trim()) nextErrors.systemName = 'Nom du système requis.';
    if (Number.isNaN(draft.maxFileSizeMB) || draft.maxFileSizeMB <= 0) {
      nextErrors.maxFileSizeMB = 'Taille maximale doit être > 0.';
    }
    if (draft.retentionDays < 0) nextErrors.retentionDays = "Durée d'archivage ne peut pas être négative.";

    if (derivedAllowedTypes.length === 0) nextErrors.allowedFileTypes = 'Définissez au moins un type de fichier (ex: pdf, docx).';

    if (draft.autoNumberingEnabled && !draft.numberingPattern.trim()) {
      nextErrors.numberingPattern = 'Motif de numérotation requis si la numérotation est activée.';
    }

    return nextErrors;
  };

  const onSave = async () => {
    if (!draft) return;
    setSuccessMessage(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const next: AdminGeneralConfig = {
        ...draft,
        allowedFileTypes: derivedAllowedTypes,
      };
      await saveGeneralConfig(next);
      setSuccessMessage('Configuration sauvegardée.');
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    setSuccessMessage(null);
    setErrors({});
    setLoading(true);
    try {
      const cfg = await resetGeneralConfig();
      setDraft(cfg);
      setAllowedTypesText(cfg.allowedFileTypes.join(', '));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <AdminShell
        title="General Configuration"
        description="Accès refusé pour ce rôle."
        icon={ICONS.Config}
      >
        <div className="card-navy p-6">
          <p className="text-slate-300">Seul l’utilisateur avec le rôle `Admin` peut modifier la configuration du DMS.</p>
        </div>
      </AdminShell>
    );
  }

  if (loading || !draft) {
    return (
      <AdminShell
        title="General Configuration"
        description="Chargement de la configuration…"
        icon={ICONS.Config}
      >
        <div className="card-navy p-6">
          <p className="text-slate-300">Veuillez patienter.</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Configuration générale"
      description="Paramètres globaux du système documentaire"
      icon={ICONS.Config}
    >
      <div className="card-navy p-6 space-y-6">
        {successMessage && (
          <div className="px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-white">Nom du système documentaire</label>
              <input
                value={draft.systemName}
                onChange={(e) => setDraft({ ...draft, systemName: e.target.value })}
                className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
              />
              {errors.systemName && <p className="text-xs text-red-400 mt-1">{errors.systemName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-white">Langue par défaut</label>
                <select
                  value={draft.defaultLanguage}
                  onChange={(e) => setDraft({ ...draft, defaultLanguage: e.target.value })}
                  className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="fr">fr</option>
                  <option value="en">en</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-white">Fuseau horaire</label>
                <select
                  value={draft.defaultTimezone}
                  onChange={(e) => setDraft({ ...draft, defaultTimezone: e.target.value })}
                  className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-white">Taille max (MB)</label>
                <input
                  type="number"
                  min={1}
                  value={draft.maxFileSizeMB}
                  onChange={(e) => setDraft({ ...draft, maxFileSizeMB: Number(e.target.value) })}
                  className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                />
                {errors.maxFileSizeMB && <p className="text-xs text-red-400 mt-1">{errors.maxFileSizeMB}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-white">Types autorisés</label>
                <input
                  value={allowedTypesText}
                  onChange={(e) => setAllowedTypesText(e.target.value)}
                  placeholder="pdf, docx, png"
                  className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                />
                {errors.allowedFileTypes && <p className="text-xs text-red-400 mt-1">{errors.allowedFileTypes}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-navy-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">Règles métier</h4>
              <div className="space-y-3">
                <AdminToggle
                  checked={draft.versioningEnabled}
                  onChange={(next) => setDraft({ ...draft, versioningEnabled: next })}
                  label="Activer le versioning"
                />
                <div>
                  <label className="text-sm font-semibold text-white">Durée d’archivage automatique (jours)</label>
                  <input
                    type="number"
                    min={0}
                    value={draft.retentionDays}
                    onChange={(e) => setDraft({ ...draft, retentionDays: Number(e.target.value) })}
                    className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                  />
                  {errors.retentionDays && <p className="text-xs text-red-400 mt-1">{errors.retentionDays}</p>}
                </div>
                <AdminToggle
                  checked={draft.documentsMandatoryByType}
                  onChange={(next) => setDraft({ ...draft, documentsMandatoryByType: next })}
                  label="Documents obligatoires par type"
                  title="Lorsque désactivé, les documents ne sont plus requis automatiquement."
                />
                <AdminToggle
                  checked={draft.autoNumberingEnabled}
                  onChange={(next) => setDraft({ ...draft, autoNumberingEnabled: next })}
                  label="Numérotation automatique"
                />
                {draft.autoNumberingEnabled && (
                  <div>
                    <label className="text-sm font-semibold text-white">Motif de numérotation</label>
                    <input
                      value={draft.numberingPattern}
                      onChange={(e) => setDraft({ ...draft, numberingPattern: e.target.value })}
                      className="mt-2 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                    />
                    {errors.numberingPattern && <p className="text-xs text-red-400 mt-1">{errors.numberingPattern}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="border border-navy-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">Sécurité & notifications</h4>
              <div className="space-y-3">
                <AdminToggle
                  checked={draft.security.encryptionEnabled}
                  onChange={(next) => setDraft({ ...draft, security: { ...draft.security, encryptionEnabled: next } })}
                  label="Chiffrement"
                />
                <AdminToggle
                  checked={draft.security.externalSharingEnabled}
                  onChange={(next) => setDraft({ ...draft, security: { ...draft.security, externalSharingEnabled: next } })}
                  label="Partage externe"
                />
                <AdminToggle
                  checked={draft.security.electronicSignatureEnabled}
                  onChange={(next) => setDraft({ ...draft, security: { ...draft.security, electronicSignatureEnabled: next } })}
                  label="Signature électronique"
                />

                <div className="border-t border-navy-800 pt-4" />

                <AdminToggle
                  checked={draft.notifications.emailOnUpload}
                  onChange={(next) => setDraft({ ...draft, notifications: { ...draft.notifications, emailOnUpload: next } })}
                  label="Email lors upload"
                />
                <AdminToggle
                  checked={draft.notifications.emailOnValidation}
                  onChange={(next) => setDraft({ ...draft, notifications: { ...draft.notifications, emailOnValidation: next } })}
                  label="Email lors validation"
                />
                <AdminToggle
                  checked={draft.notifications.emailOnRejection}
                  onChange={(next) => setDraft({ ...draft, notifications: { ...draft.notifications, emailOnRejection: next } })}
                  label="Email lors rejet"
                />
                <AdminToggle
                  checked={draft.notifications.reminderExpiredEnabled}
                  onChange={(next) => setDraft({ ...draft, notifications: { ...draft.notifications, reminderExpiredEnabled: next } })}
                  label="Rappel documents expirés"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onSave}
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                saving ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'
              }`}
            >
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
            <button
              onClick={onReset}
              disabled={saving}
              className="px-6 py-3 rounded-lg font-bold text-slate-200 border border-navy-800 hover:bg-navy-800/50 transition-all"
            >
              Réinitialiser
            </button>
          </div>
          <div className="text-xs text-slate-500">
            Les modifications sont appliquées aux données mock et prêtes pour la connexion backend.
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

