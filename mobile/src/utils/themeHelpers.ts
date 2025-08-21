/**
 * Theme Helper Utilities
 * Provides safe access to theme properties with fallback values
 */

import { Theme } from '../styles/theme';

/**
 * Safely get a semantic color from the theme
 * @param theme - The theme object
 * @param colorPath - Path to the color (e.g., 'primary.main', 'surface.paper')
 * @param fallback - Fallback color if path doesn't exist
 * @returns The color value or fallback
 */
export function getSemanticColor(
  theme: Theme,
  colorPath: string,
  fallback: string = '#000000'
): string {
  try {
    const parts = colorPath.split('.');
    let current: any = theme.colors.semantic;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return fallback;
      }
    }
    
    return typeof current === 'string' ? current : fallback;
  } catch (error) {
    console.error(`Error accessing theme path: ${colorPath}`, error);
    return fallback;
  }
}

/**
 * Get a color with transparency
 * @param color - The base color
 * @param opacity - Opacity value (0-1) or hex (00-FF)
 * @returns Color with transparency
 */
export function withOpacity(color: string, opacity: number | string): string {
  if (typeof opacity === 'number') {
    // Convert 0-1 to hex
    const hex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${color}${hex}`;
  }
  return `${color}${opacity}`;
}

/**
 * Safe theme property mappings for common patterns
 */
export const safeThemeColors = {
  // Surface colors
  surfaceMain: (theme: Theme) => theme.colors.semantic.surface.paper,
  surfaceRaised: (theme: Theme) => theme.colors.semantic.surface.elevated,
  surfaceBackground: (theme: Theme) => theme.colors.semantic.surface.background,
  
  // Border/Divider (no border object exists, use divider)
  borderLight: (theme: Theme) => theme.colors.semantic.divider,
  borderMain: (theme: Theme) => theme.colors.semantic.divider,
  
  // Primary colors with transparency
  primaryLight20: (theme: Theme) => withOpacity(theme.colors.semantic.primary.main, 0.2),
  primaryLight10: (theme: Theme) => withOpacity(theme.colors.semantic.primary.main, 0.1),
  
  // Text colors
  textPrimary: (theme: Theme) => theme.colors.semantic.text.primary,
  textSecondary: (theme: Theme) => theme.colors.semantic.text.secondary,
  textDisabled: (theme: Theme) => theme.colors.semantic.text.disabled,
};

/**
 * Theme validation utility
 * Checks if all expected theme paths exist
 */
export function validateTheme(theme: Theme): {
  valid: boolean;
  missingPaths: string[];
} {
  const expectedPaths = [
    'colors.semantic.primary.main',
    'colors.semantic.primary.light',
    'colors.semantic.primary.dark',
    'colors.semantic.secondary.main',
    'colors.semantic.success.main',
    'colors.semantic.warning.main',
    'colors.semantic.error.main',
    'colors.semantic.surface.paper',
    'colors.semantic.surface.elevated',
    'colors.semantic.surface.background',
    'colors.semantic.text.primary',
    'colors.semantic.text.secondary',
    'colors.semantic.text.disabled',
    'colors.semantic.divider',
  ];
  
  const missingPaths: string[] = [];
  
  for (const path of expectedPaths) {
    const parts = path.split('.');
    let current: any = theme;
    let valid = true;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        valid = false;
        break;
      }
    }
    
    if (!valid) {
      missingPaths.push(path);
    }
  }
  
  return {
    valid: missingPaths.length === 0,
    missingPaths,
  };
}