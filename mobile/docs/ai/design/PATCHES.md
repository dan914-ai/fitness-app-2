# Implementation Patches

## 1. Design Token System Setup

### Create Theme Provider

```typescript
// src/styles/theme.ts
import { design-tokens.json content here

} from './tokens';

export const theme = {
  colors: tokens.colors,
  typography: tokens.typography,
  spacing: tokens.spacing,
  borderRadius: tokens.borderRadius,
  elevation: tokens.elevation,
  animation: tokens.animation,
};

// Light theme
export const lightTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: tokens.colors.semantic.surface.background,
    surface: tokens.colors.semantic.surface.paper,
    text: tokens.colors.semantic.text.primary,
    textSecondary: tokens.colors.semantic.text.secondary,
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
  },
};
```

## 2. Unified Button Component

### Replace Current Implementation

```diff
- <TouchableOpacity style={styles.button} onPress={handlePress}>
-   <Text style={styles.buttonText}>Start Workout</Text>
- </TouchableOpacity>
+ <Button 
+   variant="primary"
+   size="large"
+   onPress={handlePress}
+ >
+   Start Workout
+ </Button>
```

### Button Component Implementation

```typescript
// src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '@expo/vector-icons';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onPress,
  children,
}) => {
  const theme = useTheme();
  
  const styles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing[4],
      height: theme.sizing.button[size],
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.38 : 1,
      ...getVariantStyles(variant, theme),
    },
    text: {
      ...theme.typography.textStyles.button,
      color: getTextColor(variant, theme),
      marginLeft: icon && iconPosition === 'left' ? theme.spacing[2] : 0,
      marginRight: icon && iconPosition === 'right' ? theme.spacing[2] : 0,
    },
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor(variant, theme)} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Icon name={icon} />}
          <Text style={styles.text}>{children}</Text>
          {icon && iconPosition === 'right' && <Icon name={icon} />}
        </>
      )}
    </TouchableOpacity>
  );
};
```

## 3. Input Component Standardization

### Before
```typescript
<TextInput
  style={styles.input}
  placeholder="Enter weight"
  value={weight}
  onChangeText={setWeight}
/>
```

### After
```typescript
<Input
  label="Weight"
  placeholder="Enter weight"
  value={weight}
  onChangeText={setWeight}
  keyboardType="numeric"
  rightIcon="info"
  helperText="In kilograms"
/>
```

## 4. Card Component Unification

### Before (Multiple Implementations)
```typescript
// Various card styles
<View style={styles.card}>...</View>
<View style={styles.statCard}>...</View>
<View style={styles.exerciseCard}>...</View>
```

### After (Single Component)
```typescript
<Card variant="elevated" padding="medium">
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## 5. Navigation Pattern Update

### Bottom Navigation with FAB

```typescript
// src/navigation/MainNavigator.tsx
const MainNavigator = () => {
  const [fabOpen, setFabOpen] = useState(false);
  
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            height: 56,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: theme.colors.semantic.primary.main,
          tabBarInactiveTintColor: theme.colors.semantic.text.secondary,
        }}
      >
        {/* Tab screens */}
      </Tab.Navigator>
      
      <FAB
        icon="add"
        position="bottom-center"
        onPress={() => setFabOpen(!fabOpen)}
        extended={fabOpen}
        actions={[
          { icon: 'timer', label: 'Quick Start', onPress: handleQuickStart },
          { icon: 'fitness', label: 'From Program', onPress: handleProgram },
          { icon: 'create', label: 'Custom', onPress: handleCustom },
        ]}
      />
    </View>
  );
};
```

## 6. Typography System Application

### Before
```typescript
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>Workout</Text>
<Text style={{ fontSize: 16, color: '#636E72' }}>Description</Text>
```

### After
```typescript
<Text style={theme.typography.textStyles.h3}>Workout</Text>
<Text style={[theme.typography.textStyles.body, { color: theme.colors.semantic.text.secondary }]}>
  Description
</Text>
```

## 7. Spacing Grid Implementation

### Before (Inconsistent)
```typescript
padding: 12,
margin: 8,
paddingHorizontal: 20,
```

### After (8pt Grid)
```typescript
padding: theme.spacing[3], // 12px -> 12px (3*4)
margin: theme.spacing[2],  // 8px
paddingHorizontal: theme.spacing[5], // 20px
```

## 8. Color Token Migration

### Before
```typescript
backgroundColor: '#FF6B6B',
color: '#2D3436',
borderColor: '#E0E0E0',
```

### After
```typescript
backgroundColor: theme.colors.semantic.primary.main,
color: theme.colors.semantic.text.primary,
borderColor: theme.colors.semantic.divider,
```

## 9. Elevation System

### Before (Mixed Shadows)
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.25,
shadowRadius: 3.84,
elevation: 5,
```

### After (Standardized)
```typescript
...theme.elevation[4], // Consistent elevation
```

## 10. Loading State Unification

### Before (Various Patterns)
```typescript
{isLoading && <ActivityIndicator />}
{isLoading && <SkeletonLoader />}
{isLoading && <Text>Loading...</Text>}
```

### After (Single Component)
```typescript
<LoadingState
  variant="skeleton" // or 'spinner' or 'progress'
  text="Loading workouts..."
/>
```

## 11. Empty State Standardization

### Before
```typescript
{data.length === 0 && (
  <View>
    <Text>No workouts found</Text>
  </View>
)}
```

### After
```typescript
{data.length === 0 && (
  <EmptyState
    icon="fitness"
    title="No workouts yet"
    description="Start your first workout to see it here"
    action={{
      label: "Start Workout",
      onPress: handleStartWorkout
    }}
  />
)}
```

## 12. Form Validation Pattern

### Before (Inline)
```typescript
{error && <Text style={{ color: 'red' }}>{error}</Text>}
```

### After (Integrated)
```typescript
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  helperText="Enter your email address"
/>
```

## 13. Modal/Sheet Consistency

### Before
```typescript
<Modal visible={visible} transparent animationType="slide">
  <View style={styles.modalBackdrop}>
    <View style={styles.modalContent}>
      {/* Content */}
    </View>
  </View>
</Modal>
```

### After
```typescript
<Sheet
  visible={visible}
  onDismiss={handleDismiss}
  variant="bottom"
>
  <SheetContent>
    {/* Content */}
  </SheetContent>
</Sheet>
```

## 14. Icon System

### Before (Mixed Sizes)
```typescript
<Icon name="fitness" size={24} />
<Icon name="timer" size={32} />
<Icon name="check" size={16} />
```

### After (Standardized)
```typescript
<Icon name="fitness" size={theme.sizing.icon.medium} />
<Icon name="timer" size={theme.sizing.icon.large} />
<Icon name="check" size={theme.sizing.icon.small} />
```

## 15. Accessibility Improvements

### Add Focus States
```typescript
const [focused, setFocused] = useState(false);

<TouchableOpacity
  accessible
  accessibilityRole="button"
  accessibilityLabel="Start workout"
  accessibilityHint="Begins a new workout session"
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
  style={[
    styles.button,
    focused && styles.buttonFocused
  ]}
>
```

### Add Screen Reader Support
```typescript
<View 
  accessible
  accessibilityRole="header"
  accessibilityLabel="Workout summary"
>
  <Text>Workout Complete</Text>
</View>
```

## Implementation Order

### Phase 1: Core Setup (2 hours)
1. Create theme system
2. Implement design tokens
3. Setup ThemeProvider

### Phase 2: Basic Components (3 hours)
4. Button component
5. Input component
6. Card component
7. Typography utilities

### Phase 3: Navigation (2 hours)
8. Bottom navigation update
9. FAB implementation
10. AppBar standardization

### Phase 4: Complex Components (3 hours)
11. Modal/Sheet system
12. Loading states
13. Empty states
14. Form patterns

### Phase 5: Screen Updates (4 hours)
15. Update all screens to use new components
16. Remove hardcoded styles
17. Apply design tokens throughout

### Phase 6: Cleanup (2 hours)
18. Remove deprecated components
19. Update imports
20. Final testing

## Testing Checklist

- [ ] All buttons clickable
- [ ] Forms submit correctly
- [ ] Navigation works
- [ ] Modals open/close
- [ ] Loading states display
- [ ] Empty states show
- [ ] Accessibility features work
- [ ] No visual regressions
- [ ] Performance maintained
- [ ] Bundle size acceptable