import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { lightTheme as designLightTheme, darkTheme as designDarkTheme, Theme } from '../styles/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

// For backward compatibility, map old interface to new theme
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  shadow: string;
  surfaceElevated?: string;
  primaryDark?: string;
}

// Map new design tokens to old interface for compatibility
const mapThemeToLegacy = (theme: Theme): ThemeColors => ({
  primary: theme.colors.semantic.primary.main,
  secondary: theme.colors.semantic.secondary.main,
  background: theme.colors.background,
  surface: theme.colors.surface,
  text: theme.colors.text,
  textSecondary: theme.colors.textSecondary,
  textLight: theme.colors.textDisabled,
  border: theme.colors.divider,
  success: theme.colors.semantic.success.main,
  warning: theme.colors.semantic.warning.main,
  error: theme.colors.semantic.error.main,
  info: theme.colors.semantic.info.main,
  shadow: '#000000',
  surfaceElevated: theme.colors.surface,
  primaryDark: theme.colors.semantic.primary.dark,
});

const lightTheme: ThemeColors = mapThemeToLegacy(designLightTheme);
const darkTheme: ThemeColors = mapThemeToLegacy(designDarkTheme);

interface ThemeContextType {
  theme: ThemeColors;
  fullTheme: Theme; // Add access to full design system theme
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme based on mode and system preference
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemePreference(mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('light');
    } else {
      // If system, switch to opposite of current
      setThemeMode(isDarkMode ? 'light' : 'dark');
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;
  const fullTheme = isDarkMode ? designDarkTheme : designLightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        fullTheme,
        isDarkMode,
        themeMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper hook to get themed styles
export function useThemedStyles<T>(
  styleFactory: (theme: ThemeColors, isDarkMode: boolean) => T
): T {
  const { theme, isDarkMode } = useTheme();
  return styleFactory(theme, isDarkMode);
}

// Hook to access full design system theme
export function useDesignSystem() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a ThemeProvider');
  }
  return context.fullTheme;
}