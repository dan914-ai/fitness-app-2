export const Colors = {
  // Primary colors - Minimal Monochrome Theme
  primary: '#228BE6',        // Accent Blue (for CTAs and highlights)
  primaryLight: '#E7F5FF',   // Light blue tint for backgrounds
  secondary: '#495057',      // Primary Gray (for secondary actions)
  accent: '#228BE6',         // Same as primary for consistency
  
  // Base colors
  background: '#F8F9FA',     // Light gray background
  surface: '#FFFFFF',        // Pure white for cards
  
  // Text colors
  text: '#212529',           // Dark gray/black for primary text
  textSecondary: '#495057',  // Medium gray for secondary text
  textLight: '#868E96',      // Light gray for hints/placeholders
  
  // Semantic colors (kept but adapted to flat style)
  success: '#51CF66',        // Softer green
  warning: '#FFD43B',        // Softer yellow
  error: '#FF6B6B',          // Softer red
  info: '#339AF0',           // Blue variant
  
  // Tier colors (muted versions)
  bronze: '#B08D57',
  silver: '#909296',
  gold: '#F0B429',
  platinum: '#D0D0D0',
  diamond: '#91C7DC',
  challenger: '#E54545',
  
  // Tab bar
  tabBarActive: '#228BE6',   // Accent blue for active
  tabBarInactive: '#868E96', // Light gray for inactive
  
  // Borders
  border: '#E9ECEF',         // Very light gray border
  divider: '#F1F3F5',        // Even lighter for dividers
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.3)',      // Lighter overlay
  modalBackground: 'rgba(0, 0, 0, 0.5)', // Medium overlay for modals
  
  // Wellness colors (muted)
  water: '#74C0FC',
  sleep: '#9775FA',
  nutrition: '#69DB7C',
  body: '#FF8787',
  mood: '#FFC078',
  calculator: '#748FFC',
  primaryDark: '#1971C2',    // Darker blue for pressed states
  secondaryDark: '#343A40',  // Darker gray for pressed states
};

// Shadow system for the minimal design
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  }
};

// Spacing system for consistent layout
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius for rounded corners
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};