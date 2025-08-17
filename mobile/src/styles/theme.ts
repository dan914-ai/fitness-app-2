import { tokens } from './tokens';

export const theme = {
  colors: tokens.colors,
  typography: tokens.typography,
  spacing: tokens.spacing,
  sizing: tokens.sizing,
  borderRadius: tokens.borderRadius,
  elevation: tokens.elevation,
  animation: tokens.animation,
  zIndex: tokens.zIndex,
};

// Light theme (default)
export const lightTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: tokens.colors.semantic.surface.background,
    surface: tokens.colors.semantic.surface.paper,
    text: tokens.colors.semantic.text.primary,
    textSecondary: tokens.colors.semantic.text.secondary,
    textDisabled: tokens.colors.semantic.text.disabled,
    divider: tokens.colors.semantic.divider,
  },
};

// Dark theme (future)
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textDisabled: 'rgba(255, 255, 255, 0.38)',
    divider: 'rgba(255, 255, 255, 0.12)',
  },
};

export type Theme = typeof lightTheme;
export type ThemeColors = typeof lightTheme.colors;