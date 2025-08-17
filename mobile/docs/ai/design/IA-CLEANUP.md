# Information Architecture Cleanup Proposal

## Current Issues

### 1. Navigation Redundancy
- **Start Workout** accessible from:
  - Home screen button
  - FAB on routine screens
  - Program detail screens
  - Empty state CTAs
  - Multiple menu items

### 2. Component Duplication
- **7 Thumbnail Components** serving similar purposes
- **3 Timer Components** with overlapping functionality
- **Multiple Button Styles** without clear hierarchy
- **Various Card Implementations** without consistency

### 3. Screen Organization Issues
- Unclear hierarchy between Programs, Routines, and Workouts
- Mixed terminology (Workout vs Training vs Exercise)
- Duplicate screens with similar functionality

## Proposed IA Structure

### Primary Navigation (Bottom Tabs)

```
┌─────────┬──────────┬─────────┬──────────┬──────────┐
│  Home   │ Programs │ Workout │  Stats   │ Profile  │
└─────────┴──────────┴─────────┴──────────┴──────────┘
```

1. **Home** - Dashboard & Quick Actions
2. **Programs** - Structured workout programs
3. **Workout** - Active workout hub (FAB for quick start)
4. **Stats** - Progress, history, achievements
5. **Profile** - Settings, goals, preferences

### Screen Hierarchy

#### Home Tab
```
Home
├── Dashboard (default)
│   ├── Today's workout
│   ├── Weekly progress
│   └── Quick stats
├── Recovery Dashboard
└── Quick Timer
```

#### Programs Tab
```
Programs
├── Program List
│   ├── Active Program
│   └── Available Programs
├── Program Detail
│   ├── Overview
│   ├── Schedule
│   └── Exercises
└── Program Selection
```

#### Workout Tab (Central Hub)
```
Workout
├── Start Options (FAB menu)
│   ├── Quick Start
│   ├── From Program
│   └── Custom Routine
├── Active Workout
│   ├── Exercise Track
│   ├── Rest Timer
│   └── Set Management
├── Routines
│   ├── My Routines
│   ├── Create Routine
│   └── Routine Detail
└── Exercise Library
```

#### Stats Tab
```
Stats
├── Overview
├── Workout History
├── Personal Records
├── Achievements
├── Body Metrics
└── Analytics
```

#### Profile Tab
```
Profile
├── User Info
├── Goals
├── Settings
│   ├── App Settings
│   ├── Notifications
│   └── Privacy
├── Calculators
│   ├── 1RM Calculator
│   ├── Calorie Calculator
│   └── Macro Calculator
└── About
```

## Component Consolidation

### 1. Unified Thumbnail System

Replace 7 thumbnail components with single configurable component:

```typescript
<ExerciseThumbnail
  source={source}
  size="small|medium|large"
  variant="square|circle"
  loading={loading}
  fallback={fallback}
/>
```

### 2. Single Timer Component

Consolidate 3 timers into one:

```typescript
<Timer
  mode="countdown|stopwatch|interval"
  duration={seconds}
  onComplete={callback}
  size="small|medium|large"
/>
```

### 3. Button Hierarchy

Clear button system:
- **Primary**: Main CTA (1 per screen max)
- **Secondary**: Supporting actions
- **Tertiary**: Low-emphasis actions
- **FAB**: Primary workout action

### 4. Card Patterns

Standardize cards:
- **Content Card**: Information display
- **Action Card**: Interactive items
- **Stat Card**: Metrics display
- **Exercise Card**: Workout specific

## Navigation Patterns

### 1. Primary Actions via FAB

Central FAB for workout actions:
```
     [+]
    /   \
   /     \
Quick  Program
Start  Workout
```

### 2. Contextual Actions

Screen-specific actions in AppBar:
- Right side: Context menu
- Left side: Back/Menu

### 3. Tab Badge System

Show status on tabs:
- Red dot: New content
- Number: Count (e.g., exercises)
- Icon change: Active state

## Terminology Standardization

### Consistent Naming
- **Program**: Multi-week structured plan
- **Routine**: Reusable workout template
- **Workout**: Single training session
- **Exercise**: Individual movement
- **Set**: Single execution of reps
- **Rep**: Single repetition

### Action Terminology
- **Start**: Begin new workout
- **Resume**: Continue paused workout
- **Complete**: Finish workout
- **Track**: Log exercise data
- **Rest**: Timer between sets

## User Flow Optimization

### 1. Quick Start Flow
```
Home → FAB → Quick Start → Exercise Selection → Workout → Complete → Summary
```

### 2. Program Flow
```
Programs → Select Program → Today's Workout → Start → Track → Complete → Progress
```

### 3. Custom Routine Flow
```
Workout Tab → Routines → Create/Select → Start → Track → Complete → Save
```

## Deduplication Strategy

### Phase 1: Component Level
1. Create unified components
2. Update imports across app
3. Remove duplicate files
4. Test functionality

### Phase 2: Screen Level
1. Identify redundant screens
2. Merge functionality
3. Update navigation
4. Remove duplicates

### Phase 3: Feature Level
1. Consolidate overlapping features
2. Simplify user flows
3. Update documentation
4. User testing

## Migration Plan

### Non-Breaking Changes (Immediate)
- Add new unified components
- Update styling to use tokens
- Improve existing screens

### Deprecation Phase (2 weeks)
- Mark old components deprecated
- Console warnings for old usage
- Update documentation

### Cleanup Phase (4 weeks)
- Remove deprecated components
- Clean up navigation
- Final testing

## Success Metrics

### Quantitative
- 50% reduction in component files
- 30% reduction in navigation paths
- 25% smaller bundle size
- 100% design token adoption

### Qualitative
- Clearer user flows
- Consistent experience
- Easier maintenance
- Better accessibility

## Risk Mitigation

### Testing Strategy
1. Unit tests for new components
2. Integration tests for flows
3. Visual regression testing
4. User acceptance testing

### Rollback Plan
1. Feature flags for major changes
2. Git branch strategy
3. Incremental deployment
4. User feedback loops

## Implementation Priority

### High Priority
1. Button consolidation
2. Navigation simplification
3. Thumbnail unification
4. Timer consolidation

### Medium Priority
5. Card standardization
6. Screen deduplication
7. Terminology updates
8. Tab restructuring

### Low Priority
9. Empty state improvements
10. Loading state unification
11. Animation consistency
12. Micro-interactions