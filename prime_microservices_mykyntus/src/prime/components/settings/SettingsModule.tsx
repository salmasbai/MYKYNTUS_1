import React, { useEffect, useState } from 'react';
import { User, Bell, Layers, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useRole } from '../../contexts/RoleContext';
import { Role } from '../../models';
import { SettingsService } from '../../services/settings.service';
import { mockDepartments } from '../../mock-data';
import { formatOrgCompactLine, getPersonalOrgLabels } from '../../lib/personalOrgLabels';

const ROLE_LABEL: Record<Role, string> = {
  Pilote: 'Pilote',
  RH: 'RH',
  Admin: 'Administrateur',
  Manager: 'Manager',
  Coach: 'Coach',
  Audit: 'Audit',
  RP: 'Responsable projet',
};

export const SettingsModule: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentRole, currentUser } = useRole();
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

  const org = getPersonalOrgLabels(currentUser, mockDepartments);
  const orgCompact = formatOrgCompactLine({
    departement: org.departement,
    pole: org.pole,
    cellule: org.cellule,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8 min-h-full bg-app">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Paramètres</h1>
        <p className="text-sm text-muted mt-1">Profil, notifications et préférences.</p>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">Enregistré.</div>
      )}

      <section className="bg-card border border-default rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-default">
          <User className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-primary">Profil</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Informations personnelles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 sm:gap-y-0 text-sm min-w-0">
              <div className="min-w-0">
                <span className="text-muted block mb-0.5">Nom</span>
                <p className="text-primary font-medium mb-2 sm:mb-0 break-words">{currentUser.lastName}</p>
              </div>
              <div className="min-w-0">
                <span className="text-muted block mb-0.5">Prénom</span>
                <p className="text-primary font-medium mb-2 sm:mb-0 break-words">{currentUser.firstName}</p>
              </div>
              <div className="min-w-0">
                <span className="text-muted block mb-0.5">Rôle</span>
                <p className="text-primary font-medium mb-0 break-words">{ROLE_LABEL[currentRole]}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-default pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Organisation</h3>
            <p className="text-sm text-muted leading-snug">{orgCompact || '—'}</p>
          </div>

          <div className="border-t border-default pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Contact</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted block mb-0.5">E-mail</span>
                <p className="text-primary font-medium mb-0">{currentUser.email}</p>
              </div>
              <div className="rounded-lg border border-default bg-app/50 p-2">
                <span className="text-muted block mb-0.5">Annuaire</span>
                <p className="text-muted text-xs mt-1 leading-relaxed mb-0">Utilisateur A, Utilisateur B, Utilisateur C…</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted pt-3 border-t border-default">Départements : RH · Finance · Opérations — Projets : Primes · Performance · Qualité</p>
      </section>

      <section className="bg-card border border-default rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-default">
          <Bell className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-primary">Notifications</h2>
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
            <label key={key} className="flex items-center justify-between p-3 rounded-lg bg-app border border-default">
              <span className="text-sm text-primary">{label}</span>
              <input
                type="checkbox"
                className="rounded border-default"
                checked={prefs[key] !== false}
                onChange={() => persistPrefs({ ...prefs, [key]: !prefs[key] })}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="bg-card border border-default rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-default">
          <Layers className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-primary">Interface</h2>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-app border border-default">
          <span className="text-sm text-primary">Mode compact (espacements réduits)</span>
          <input
            type="checkbox"
            className="rounded border-default"
            checked={compactMode}
            onChange={() => persistUi(!compactMode)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              theme === 'dark' ? 'bg-blue-600/10 border-blue-500/50 text-primary' : 'bg-app border-default text-muted hover:bg-card'
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
              theme === 'light' ? 'bg-blue-600/10 border-blue-500/50 text-primary' : 'bg-app border-default text-muted hover:bg-card'
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
