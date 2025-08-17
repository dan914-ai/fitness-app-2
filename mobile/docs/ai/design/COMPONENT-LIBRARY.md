# Component Library Specification

## Design System Components

### 1. Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
  size: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  onPress: () => void;
  children: string;
}
```

**Variants:**
- **Primary**: Filled with primary color, white text
- **Secondary**: Outlined with primary color border
- **Tertiary**: Text only, no background
- **Destructive**: Red background for dangerous actions
- **Ghost**: Subtle background on hover/press

**Sizes:**
- Small: 32px height, 14px font
- Medium: 44px height, 16px font (default)
- Large: 56px height, 18px font

**States:**
- Default
- Hover (web): 4% black overlay
- Pressed: 8% black overlay
- Disabled: 38% opacity
- Loading: Show spinner, disable interaction

### 2. IconButton Component

```typescript
interface IconButtonProps {
  icon: IconName;
  size: 'small' | 'medium' | 'large';
  variant: 'default' | 'primary' | 'secondary';
  onPress: () => void;
  disabled?: boolean;
}
```

**Sizes:**
- Small: 32px touch target, 16px icon
- Medium: 44px touch target, 24px icon
- Large: 56px touch target, 32px icon

### 3. Input Component

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardType;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
}
```

**States:**
- Default: Grey border
- Focus: Primary color border, 2px
- Error: Error color border with message
- Disabled: 38% opacity
- Success: Success color border

### 4. Card Component

```typescript
interface CardProps {
  variant: 'flat' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  children: ReactNode;
}
```

**Variants:**
- Flat: No elevation, background color
- Outlined: 1px border, no elevation
- Elevated: Shadow/elevation level 2

### 5. ListItem Component

```typescript
interface ListItemProps {
  title: string;
  subtitle?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
}
```

**Structure:**
- Min height: 56px
- Padding: 16px horizontal
- Touch target: Full row
- Divider: Optional bottom border

### 6. Chip Component

```typescript
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  icon?: IconName;
  variant: 'filled' | 'outlined';
  size: 'small' | 'medium';
}
```

### 7. AppBar Component

```typescript
interface AppBarProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: IconName;
    onPress: () => void;
  };
  rightActions?: Array<{
    icon: IconName;
    onPress: () => void;
  }>;
  variant: 'default' | 'prominent' | 'transparent';
}
```

### 8. BottomNavigation Component

```typescript
interface BottomNavigationProps {
  items: Array<{
    label: string;
    icon: IconName;
    badge?: number | boolean;
  }>;
  activeIndex: number;
  onIndexChange: (index: number) => void;
}
```

### 9. FAB (Floating Action Button)

```typescript
interface FABProps {
  icon: IconName;
  onPress: () => void;
  extended?: boolean;
  label?: string;
  position?: 'bottom-right' | 'bottom-center';
  visible?: boolean;
}
```

### 10. Modal/Sheet Component

```typescript
interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  variant: 'center' | 'bottom' | 'fullscreen';
  dismissable?: boolean;
}
```

### 11. Toast Component

```typescript
interface ToastProps {
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  duration?: number;
  variant: 'default' | 'success' | 'error' | 'warning';
}
```

### 12. EmptyState Component

```typescript
interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}
```

### 13. LoadingState Component

```typescript
interface LoadingStateProps {
  variant: 'spinner' | 'skeleton' | 'progress';
  text?: string;
  progress?: number;
}
```

### 14. Badge Component

```typescript
interface BadgeProps {
  value: number | string;
  variant: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size: 'small' | 'medium';
  max?: number;
}
```

## Fitness-Specific Components

### 15. ExerciseCard Component

```typescript
interface ExerciseCardProps {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  thumbnail?: string;
  completed?: boolean;
  onPress?: () => void;
  onStartPress?: () => void;
}
```

### 16. TimerDisplay Component

```typescript
interface TimerDisplayProps {
  time: number; // seconds
  variant: 'countdown' | 'stopwatch';
  size: 'small' | 'medium' | 'large';
  status: 'idle' | 'running' | 'paused' | 'complete';
  onToggle?: () => void;
  onReset?: () => void;
}
```

### 17. SetTracker Component

```typescript
interface SetTrackerProps {
  sets: Array<{
    weight: number;
    reps: number;
    completed: boolean;
  }>;
  onSetComplete: (index: number) => void;
  onSetEdit: (index: number, data: SetData) => void;
}
```

### 18. ProgressRing Component

```typescript
interface ProgressRingProps {
  progress: number; // 0-100
  size: 'small' | 'medium' | 'large';
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
}
```

### 19. WorkoutSummary Component

```typescript
interface WorkoutSummaryProps {
  duration: number;
  exercises: number;
  sets: number;
  volume: number;
  calories?: number;
  pr?: boolean;
}
```

### 20. StatCard Component

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: IconName;
  color?: string;
}
```

## Component Tokens Mapping

All components use the design tokens defined in `design-tokens.json`:

### Color Usage
- Primary actions: `colors.semantic.primary`
- Secondary actions: `colors.semantic.secondary`
- Destructive actions: `colors.semantic.error`
- Success states: `colors.semantic.success`
- Text: `colors.semantic.text`

### Spacing Usage
- Component padding: `spacing.4` (16px) default
- Component margins: `spacing.2` (8px) between elements
- List item padding: `spacing.4` (16px) horizontal

### Typography Usage
- Headings: `typography.textStyles.h1-h6`
- Body text: `typography.textStyles.body`
- Buttons: `typography.textStyles.button`
- Captions: `typography.textStyles.caption`

### Elevation Usage
- Cards: `elevation.2`
- Modals: `elevation.16`
- FAB: `elevation.8`
- AppBar: `elevation.4`

### Animation Usage
- Transitions: `animation.duration.fast` (200ms)
- Loading: `animation.duration.normal` (300ms)
- Complex: `animation.duration.slow` (500ms)

## Accessibility Requirements

All components must:
1. Have minimum 44px touch targets
2. Include proper ARIA labels
3. Support keyboard navigation
4. Respect prefers-reduced-motion
5. Meet WCAG AA contrast ratios
6. Provide focus indicators
7. Support screen readers

## Implementation Priority

### Phase 1 (Core)
1. Button
2. Input
3. Card
4. Typography system

### Phase 2 (Navigation)
5. AppBar
6. BottomNavigation
7. FAB
8. ListItem

### Phase 3 (Feedback)
9. Modal/Sheet
10. Toast
11. LoadingState
12. EmptyState

### Phase 4 (Specialized)
13. ExerciseCard
14. TimerDisplay
15. SetTracker
16. WorkoutSummary

### Phase 5 (Enhancement)
17. Remaining components