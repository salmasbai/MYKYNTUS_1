import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Sun, Moon, User } from 'lucide-react';
import { ReferralService } from '../../services/ReferralService';
import type { NotificationPreferences } from '../../models/Referral';
import { useTheme } from '../../../../frontend/app/providers/ThemeProvider';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';

const ICONS = { User, Bell, Sun, Moon, Check: CheckCircle2 };

export const ReferralSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name ?? 'Utilisateur',
    email: `${user?.id ?? 'user'}@mykyntus.com`,
    department: user?.role === 'RH' ? 'Ressources Humaines' : 'Opérations',
    position: user?.role === 'RH' ? 'Responsable RH' : 'Collaborateur',
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    inApp: true,
    systemAlerts: false,
  });

  useEffect(() => {
    setProfile((p) => ({
      ...p,
      name: user?.name ?? p.name,
      department: user?.role === 'RH' ? 'Ressources Humaines' : 'Opérations',
      position: user?.role === 'RH' ? 'Responsable RH' : 'Collaborateur',
    }));
  }, [user]);

  useEffect(() => {
    setNotifications(ReferralService.getNotificationPreferences());
  }, []);

  const handleSaveProfile = () => {
    // Profile is local state for demo; could be persisted via API
  };

  const handleNotificationChange = (next: NotificationPreferences) => {
    setNotifications(next);
    ReferralService.updateNotificationPreferences(next);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white">Paramètres</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Settings */}
          <section className="card-navy p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-navy-800">
              <ICONS.User className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-white">Profil</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Département
                </label>
                <input
                  type="text"
                  value={profile.department}
                  disabled
                  className="w-full bg-navy-800 border border-navy-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Poste
                </label>
                <input
                  type="text"
                  value={profile.position}
                  disabled
                  className="w-full bg-navy-800 border border-navy-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                Enregistrer
              </button>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className="card-navy p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-navy-800">
              <ICONS.Bell className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-white">Préférences de notifications</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-navy-900/50 border border-navy-800">
                <div>
                  <h4 className="font-medium text-white mb-1">Mises à jour parrainage</h4>
                  <p className="text-sm text-slate-400">
                    Recevez des alertes lorsque vos parrainages changent de statut ou sont validés.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.inApp}
                    onChange={() =>
                      handleNotificationChange({
                        ...notifications,
                        inApp: !notifications.inApp,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-navy-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-navy-900/50 border border-navy-800">
                <div>
                  <h4 className="font-medium text-white mb-1">Annonces RH</h4>
                  <p className="text-sm text-slate-400">
                    Soyez notifié par email des actualités et annonces du programme de parrainage.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.email}
                    onChange={() =>
                      handleNotificationChange({
                        ...notifications,
                        email: !notifications.email,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-navy-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-navy-900/50 border border-navy-800">
                <div>
                  <h4 className="font-medium text-white mb-1">Alertes système</h4>
                  <p className="text-sm text-slate-400">
                    Recevez des notifications sur la maintenance planifiée et les mises à jour du système.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.systemAlerts ?? false}
                    onChange={() =>
                      handleNotificationChange({
                        ...notifications,
                        systemAlerts: !(notifications.systemAlerts ?? false),
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-navy-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Theme Settings */}
          <section className="card-navy p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-navy-800">
              <ICONS.Sun className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-white">Thème</h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-[0_0_10px_rgba(37,99,235,0.1)]'
                    : 'bg-navy-900 border-navy-800 text-slate-400 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ICONS.Moon className="w-5 h-5" />
                  <span className="font-medium">Mode sombre</span>
                </div>
                {theme === 'dark' && <ICONS.Check className="w-5 h-5 text-blue-500" />}
              </button>

              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                  theme === 'light'
                    ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-[0_0_10px_rgba(37,99,235,0.1)]'
                    : 'bg-navy-900 border-navy-800 text-slate-400 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ICONS.Sun className="w-5 h-5" />
                  <span className="font-medium">Mode clair</span>
                </div>
                {theme === 'light' && <ICONS.Check className="w-5 h-5 text-blue-500" />}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
