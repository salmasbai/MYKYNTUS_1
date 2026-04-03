const STORAGE = 'parrainage.ui.prefs.v1';

export interface UiPreferences {
  compactMode: boolean;
}

const defaults: UiPreferences = { compactMode: false };

export const UiPreferencesService = {
  get(): UiPreferences {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  },
  set(partial: Partial<UiPreferences>): void {
    const next = { ...this.get(), ...partial };
    localStorage.setItem(STORAGE, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('parrainage:ui-prefs'));
  },
};
