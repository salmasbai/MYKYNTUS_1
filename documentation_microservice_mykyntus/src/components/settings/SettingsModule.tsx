import React, { useEffect, useState } from 'react';
import { User, Bell, Layers, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Role } from '../../types';
import { SettingsService } from '../../services/settings.service';
import { formatOrgCompactLine, getPersonalOrgLabelsForRole } from '../../lib/personalOrgLabels';

interface SettingsModuleProps {
  role: Role;
}

const ROLE_LABEL: Record<Role, string> = {
  Pilote: 'Pilote',
  Coach: 'Coach',
  RH: 'RH',
  Admin: 'Administrateur',
  Manager: 'Manager',
  Audit: 'Audit',
  RP: 'Responsable projet',
};

const USER_EMAIL_BY_ROLE: Record<Role, string> = {
  Pilote: 'pilote@mykyntus.com',
  Coach: 'coach@mykyntus.com',
  RH: 'rh@mykyntus.com',
  Admin: 'admin@mykyntus.com',
  Manager: 'manager@mykyntus.com',
  Audit: 'audit@mykyntus.com',
  RP: 'rp@mykyntus.com',
};

const USER_NAME_BY_ROLE: Record<Role, string> = {
  Pilote: 'Employe Pilote',
  Coach: 'Coach terrain',
  RH: 'Responsable RH',
  Admin: 'Administrateur',
  Manager: 'Manager',
  Audit: 'Auditeur',
  RP: 'Responsable Projet',
};

/** Prénom = premier mot, Nom = reste du libellé démo. */
function splitDisplayName(full: string): { prenom: string; nom: string } {
  const t = full.trim();
  if (!t) return { prenom: '—', nom: '—' };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { prenom: parts[0], nom: '—' };
  return { prenom: parts[0], nom: parts.slice(1).join(' ') };
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ role }) => {
  const { theme, toggleTheme } = useAppContext();
  const [prefs, setPrefs] = useState(SettingsService.getNotificationPreferences());
  const [saved, setSaved] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    setPrefs(SettingsService.getNotificationPreferences());
  }, []);

  const persistPrefs = (next: typeof prefs) => {
    setPrefs(next);
    SettingsService.updateNotificationPreferences(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const persistUi = (compact: boolean) => {
    setCompactMode(compact);
  };

  const org = getPersonalOrgLabelsForRole(role);
  const orgCompact = formatOrgCompactLine({
    departement: org.departement,
    pole: org.pole,
    cellule: org.cellule,
  });
  const { prenom, nom } = splitDisplayName(USER_NAME_BY_ROLE[role]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Paramètres</h1>
        <p className="text-sm text-slate-500 mt-1">Profil, notifications et préférences.</p>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">Enregistré.</div>
      )}

      <section className="card-navy p-4 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-navy-800">
          <User className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-white">Profil</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Informations personnelles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 sm:gap-y-0 text-sm min-w-0">
              <div className="min-w-0">
                <span className="text-slate-500 block mb-0.5">Nom</span>
                <p className="text-slate-100 font-medium mb-2 sm:mb-0 break-words">{nom}</p>
              </div>
              <div className="min-w-0">
                <span className="text-slate-500 block mb-0.5">Prénom</span>
                <p className="text-slate-100 font-medium mb-2 sm:mb-0 break-words">{prenom}</p>
              </div>
              <div className="min-w-0">
                <span className="text-slate-500 block mb-0.5">Rôle</span>
                <p className="text-slate-100 font-medium mb-0 break-words">{ROLE_LABEL[role]}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-navy-800 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Organisation</h3>
            <p className="text-sm text-slate-400 leading-snug">{orgCompact || '—'}</p>
          </div>

          <div className="border-t border-navy-800 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Contact</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500 block mb-0.5">E-mail</span>
                <p className="text-slate-100 font-medium mb-0">{USER_EMAIL_BY_ROLE[role]}</p>
              </div>
              <div className="rounded-lg border border-navy-800 bg-navy-900/40 p-2">
                <span className="text-slate-500 block mb-0.5">Annuaire</span>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed mb-0">Utilisateur A, Utilisateur B, Utilisateur C…</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 pt-3 border-t border-navy-800">Départements : RH · Finance · Opérations — Projets : Documentation · Qualité · Conformité</p>
      </section>

      <section className="card-navy p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-navy-800">
          <Bell className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: 'inApp' as const, label: 'Notifications dans l’application' },
            { key: 'email' as const, label: 'E-mails' },
            { key: 'referrals' as const, label: 'Nouveaux parrainages' },
            { key: 'approvals' as const, label: 'Approbations / refus' },
            { key: 'payments' as const, label: 'Récompenses & versements' },
            { key: 'systemAlerts' as const, label: 'Alertes système' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-lg bg-navy-900/50 border border-navy-800">
              <span className="text-sm text-slate-300">{label}</span>
              <input
                type="checkbox"
                className="rounded border-navy-700"
                checked={prefs[key] !== false}
                onChange={() => persistPrefs({ ...prefs, [key]: !prefs[key] })}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="card-navy p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-navy-800">
          <Layers className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-white">Interface</h2>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-navy-900/50 border border-navy-800">
          <span className="text-sm text-slate-300">Mode compact (espacements réduits)</span>
          <input
            type="checkbox"
            className="rounded border-navy-700"
            checked={compactMode}
            onChange={() => persistUi(!compactMode)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              theme === 'dark' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'bg-navy-900 border-navy-800 text-slate-400 hover:bg-navy-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Moon className="w-5 h-5" /> Sombre
            </span>
            {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
          </button>
          <button
            type="button"
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              theme === 'light' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'bg-navy-900 border-navy-800 text-slate-400 hover:bg-navy-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-5 h-5" /> Clair
            </span>
            {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
          </button>
        </div>
      </section>
    </div>
  );
};
