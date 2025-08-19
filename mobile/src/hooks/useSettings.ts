import { useState, useEffect } from 'react';
import { settingsService, AppSettings } from '../services/settings.service';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load settings on mount
    settingsService.loadSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
      setLoading(false);
    });

    // Subscribe to settings changes
    const unsubscribe = settingsService.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    await settingsService.setSetting(key, value);
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    await settingsService.saveSettings(updates);
  };

  return {
    settings,
    loading,
    updateSetting,
    updateSettings,
  };
}