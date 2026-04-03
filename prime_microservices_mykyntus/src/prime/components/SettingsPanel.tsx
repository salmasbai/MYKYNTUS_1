import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { useNotifications } from '../contexts/NotificationContext';

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const { settingsOpen, closeSettings } = useNotifications();

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="flex-1 bg-slate-900/30"
        onClick={closeSettings}
        aria-hidden="true"
      />
      <aside className="w-80 max-w-full bg-card h-full shadow-xl border-l border-default flex flex-col">
        <header className="px-6 py-4 border-b border-default flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            {t('settings.title')}
          </h2>
          <button
            onClick={closeSettings}
            className="text-muted hover:text-primary text-sm"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-muted mb-2">
              {t('settings.theme')}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-600/10 text-blue-500'
                    : 'border-default text-primary hover:bg-app'
                }`}
              >
                {t('settings.theme.light')}
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-600/10 text-blue-500'
                    : 'border-default text-primary hover:bg-app'
                }`}
              >
                {t('settings.theme.dark')}
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-muted mb-2">
              {t('settings.notifications')}
            </h3>
            <p className="text-xs text-muted">
              {/* Placeholders pour de futures préférences plus fines */}
              {t('topbar.notifications')}
            </p>
          </section>
        </div>
      </aside>
    </div>
  );
}

