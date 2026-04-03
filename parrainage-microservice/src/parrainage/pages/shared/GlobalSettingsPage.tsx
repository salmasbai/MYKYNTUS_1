import React, { useEffect, useState } from 'react';
import { User, Bell, Layers, Sun, Moon, CheckCircle2, Cpu } from 'lucide-react';
import { ReferralService } from '@parrainage/core/services/ReferralService';
import { AdminService } from '@parrainage/core/services/AdminService';
import type { SystemConfig } from '@parrainage/core/models/SystemConfig';
import { UiPreferencesService } from '@parrainage/core/services/UiPreferencesService';
import { MOCK_DEPARTMENTS, MOCK_PROJECTS, MOCK_USERS_BY_ROLE } from '@parrainage/features/mockData/directory';
import { formatOrgCompactLine, getParrainagePersonalOrgLabels } from '../../lib/personalOrgLabels';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { useTheme } from '../../../../frontend/app/providers/ThemeProvider';

function splitFullName(name: string | undefined): { prenom: string; nom: string } {
  const t = name?.trim() ?? '';
  if (!t) return { prenom: '—', nom: '—' };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { prenom: parts[0], nom: '—' };
  return { prenom: parts[0], nom: parts.slice(1).join(' ') };
}

export const GlobalSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const role = user?.role ?? 'PILOTE';

  const [prefs, setPrefs] = useState(ReferralService.getNotificationPreferences());
  const [uiPrefs, setUiPrefs] = useState(UiPreferencesService.get());
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<SystemConfig>(AdminService.getSystemConfig());

  useEffect(() => {
    setPrefs(ReferralService.getNotificationPreferences());
    setConfig(AdminService.getSystemConfig());
    setUiPrefs(UiPreferencesService.get());
  }, []);

  useEffect(() => {
    const onCfg = () => setConfig(AdminService.getSystemConfig());
    window.addEventListener('parrainage:system-config-updated', onCfg);
    return () => window.removeEventListener('parrainage:system-config-updated', onCfg);
  }, []);

  const persistPrefs = (next: typeof prefs) => {
    setPrefs(next);
    ReferralService.updateNotificationPreferences(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const persistUi = (compact: boolean) => {
    UiPreferencesService.set({ compactMode: compact });
    setUiPrefs(UiPreferencesService.get());
  };

  const saveSystem = () => {
    if (role !== 'RH') return;
    AdminService.updateSystemConfig(config, {
      id: user?.id ?? 'admin-1',
      label: user?.name ?? 'Utilisateur',
      role: user?.role,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const showSystem = role === 'RH';
  const roleLabel =
    role === 'PILOTE'
      ? 'Pilote'
      : role === 'COACH'
        ? 'Coach'
        : role === 'MANAGER'
          ? 'Manager'
          : role === 'RP'
            ? 'Responsable projet'
            : role === 'RH'
              ? 'RH'
              : role === 'ADMIN'
                ? 'Administrateur'
                : 'Audit';

  const org = getParrainagePersonalOrgLabels(user ?? null);
  const orgCompact = formatOrgCompactLine({
    departement: org.departement,
    pole: org.pole,
    cellule: org.cellule,
  });
  const { prenom, nom } = splitFullName(user?.name);

  const mockRoster =
    role === 'MANAGER'
      ? MOCK_USERS_BY_ROLE.MANAGER
      : role === 'COACH'
        ? MOCK_USERS_BY_ROLE.COACH
        : role === 'RP'
          ? MOCK_USERS_BY_ROLE.RP
          : role === 'RH'
            ? MOCK_USERS_BY_ROLE.RH
            : role === 'ADMIN'
              ? MOCK_USERS_BY_ROLE.ADMIN
              : role === 'AUDIT'
                ? MOCK_USERS_BY_ROLE.ADMIN
                : MOCK_USERS_BY_ROLE.PILOTE;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Paramètres</h1>
        <p className="text-sm text-slate-500 mt-1">Profil, notifications et préférences — selon votre rôle.</p>
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
                <p className="text-slate-100 font-medium mb-0 break-words">{roleLabel}</p>
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
                <p className="text-slate-100 font-medium mb-0">{user?.email ?? (user?.id ? `${user.id}@mykyntus.com` : '—')}</p>
              </div>
              <div className="rounded-lg border border-navy-800 bg-navy-900/40 p-2">
                <span className="text-slate-500 block mb-0.5">Annuaire</span>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed mb-0">
                  {mockRoster.slice(0, 3).map((u) => u.name).join(', ')}
                  …
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 pt-3 border-t border-navy-800">
          Départements : {MOCK_DEPARTMENTS.map((d) => d.name).join(' · ')} — Projets : {MOCK_PROJECTS.map((p) => p.name).join(' · ')}
        </p>
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
            checked={uiPrefs.compactMode}
            onChange={() => persistUi(!uiPrefs.compactMode)}
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

      {showSystem && (
        <section className="card-navy p-6 space-y-6 border-amber-500/20">
          <div className="flex items-center gap-3 pb-4 border-b border-navy-800">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Paramètres système</h2>
          </div>
          <div className="rounded-lg border border-navy-800 bg-navy-900/40 p-4 space-y-2 mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Règles de primes (DH)</p>
            <p className="text-sm text-slate-300">
              Mode actif :{' '}
              <span className="font-semibold text-white">
                {config.referralProgramRules?.activeMode === 'CRITICAL_PERIOD'
                  ? 'Période critique'
                  : 'Standard'}
              </span>
              {' — '}
              enveloppe totale :{' '}
              <span className="text-emerald-400/90">
                {config.defaultBonusAmount} DH
              </span>{' '}
              (dérivé des tranches configurées).
            </p>
            <p className="text-xs text-slate-500">
              Modifiez les modes, montants et délais dans la page « Configuration système » (menu RH).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Limite parrainages / employé</label>
              <input
                type="number"
                className="w-full mt-1 bg-navy-900 border border-navy-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                value={config.referralLimitPerEmployee}
                onChange={(e) => setConfig({ ...config, referralLimitPerEmployee: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seuil alerte « en attente »</label>
              <input
                type="number"
                className="w-full mt-1 bg-navy-900 border border-navy-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                value={config.pendingReferralAlertThreshold ?? 5}
                onChange={(e) => setConfig({ ...config, pendingReferralAlertThreshold: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Règles détaillées : menu RH « Règles de parrainage ». Configuration avancée :{' '}
            <span className="font-mono text-slate-400">/parrainage/admin/config</span>.
          </p>
          <button type="button" onClick={saveSystem} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Enregistrer la configuration
          </button>
        </section>
      )}
    </div>
  );
};
