# GitHub Issues Draft

*Note: These issues are ready to be created via GitHub API when token is available*

## Critical Security Issues

### Issue #1: Remove Authentication Bypass
**Labels**: `bug`, `security`, `critical`, `good-first-issue`
**Assignee**: Security Team
**Milestone**: v1.0.1 Hotfix

#### Description
Production code has authentication completely bypassed with `SKIP_LOGIN = true` hardcoded in AppNavigator.tsx:534.

#### Steps to Reproduce
1. Open the app
2. Notice no login screen appears
3. Full access granted without credentials

#### Expected Behavior
Users should be required to authenticate unless explicitly in development mode.

#### Proposed Fix
```typescript
// AppNavigator.tsx:534
const SKIP_LOGIN = __DEV__ && process.env.EXPO_PUBLIC_SKIP_AUTH === 'true';
```

#### Definition of Done
- [ ] Authentication required in production
- [ ] Dev mode bypass only with env var
- [ ] Tested on both iOS and Android
- [ ] No existing users logged out

---

### Issue #2: API Keys Exposed in Source Code
**Labels**: `bug`, `security`, `critical`
**Assignee**: DevOps Team
**Milestone**: v1.0.1 Hotfix

#### Description
Supabase API keys and URLs are hardcoded in config/supabase.ts, visible in client bundle.

#### Current State
```typescript
const supabaseUrl = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const supabaseAnonKey = 'eyJhbGc...'; // Full key exposed
```

#### Required Fix
Move to environment variables:
```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

---

## Critical Performance Issues

### Issue #3: Exercise List Loading 300+ GIFs
**Labels**: `bug`, `performance`, `high-priority`
**Assignee**: Frontend Team
**Milestone**: v1.1.0

#### Description
Exercise lists load full GIF animations instead of static thumbnails, causing 50-200MB data usage and severe performance issues.

#### Impact
- Initial load: 8-12 seconds
- List scrolling: <10fps
- Memory usage: 400-600MB
- Data usage: 50-200MB per session

#### Proposed Solution
1. Generate static JPEG thumbnails for all exercises
2. Update database to use local thumbnail references
3. Load GIFs only on exercise detail view

#### Definition of Done
- [ ] All exercises have static thumbnails
- [ ] List view loads <5MB total
- [ ] Smooth 60fps scrolling
- [ ] GIFs load on-demand only

---

## High Priority Bugs

### Issue #4: Offline Mode Crashes App
**Labels**: `bug`, `offline`, `high-priority`
**Assignee**: Backend Team
**Milestone**: v1.1.0

#### Description
App crashes when network is unavailable instead of gracefully handling offline state.

#### Steps to Reproduce
1. Enable airplane mode
2. Open app
3. Try any action requiring network
4. App crashes with unhandled promise rejection

#### Proposed Fix
Implement offline-first architecture:
```typescript
try {
  const data = await fetchFromNetwork();
  await saveToCache(data);
  return data;
} catch (error) {
  const cached = await loadFromCache();
  if (cached) return cached;
  throw new OfflineError('No connection and no cached data');
}
```

---

### Issue #5: Unit Conversion Not Applied to Display
**Labels**: `bug`, `data-integrity`
**Assignee**: Backend Team
**Milestone**: v1.1.0

#### Description
Users can set preference for lbs but all weights still display in kg.

#### Current Behavior
- User sets units to lbs in settings
- Preference saved to AsyncStorage
- Display still shows kg values

#### Required Fix
Add conversion layer between storage and display:
```typescript
const displayWeight = (weight: number): string => {
  const unit = getUserUnit();
  const converted = unit === 'lbs' ? weight * 2.20462 : weight;
  return `${converted.toFixed(1)} ${unit}`;
};
```

---

## UX Improvements

### Issue #6: Add Onboarding Flow
**Labels**: `enhancement`, `ux`, `good-first-issue`
**Assignee**: UX Team
**Milestone**: v1.2.0

#### Description
New users see empty home screen with no guidance on how to start.

#### Proposed Onboarding
1. Welcome screen with app benefits
2. Goal selection (Strength/Weight Loss/Health)
3. Experience level assessment
4. Program recommendation
5. First workout scheduling

#### Mockups
[Attach Figma link when available]

---

### Issue #7: Consolidate Navigation to 3 Tabs
**Labels**: `enhancement`, `ux`, `breaking-change`
**Assignee**: Frontend Team
**Milestone**: v2.0.0

#### Current Problem
5 tabs with overlapping functionality confuse users:
- Home (has workouts)
- Record (also has workouts)
- Wellness (rarely used)
- Stats (could be in profile)
- Menu (catch-all)

#### Proposed Structure
```
Today | Library | Profile
```

---

## Code Quality

### Issue #8: Remove 80+ Backup Files from Source
**Labels**: `cleanup`, `tech-debt`, `good-first-issue`
**Assignee**: Any Developer
**Milestone**: Next Sprint

#### Description
Source directory contains 80+ backup files that should be in git history, not the codebase.

#### Files to Remove
```
src/data/exerciseDatabase.backup.ts
src/data/exerciseDatabase.backup2.ts
src/data/exerciseDatabase.backup-2025-*.ts
... (80+ files)
```

#### Action
1. Verify git history has these versions
2. Delete all .backup files
3. Add *.backup to .gitignore

---

### Issue #9: Consolidate 6 Thumbnail Components into 1
**Labels**: `refactoring`, `tech-debt`
**Assignee**: Frontend Team
**Milestone**: v1.2.0

#### Current State
6 different thumbnail components doing the same thing:
- StaticThumbnail.tsx
- FastThumbnail.tsx
- OptimizedThumbnail.tsx
- HybridThumbnail.tsx
- StaticGifThumbnail.tsx
- InstantThumbnail.tsx

#### Proposed Solution
Single component with options:
```typescript
interface ThumbnailProps {
  source: ImageSource;
  size?: number;
  fallback?: ImageSource;
  onPress?: () => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ 
  source, 
  size = 44, 
  fallback,
  onPress 
}) => {
  // Single implementation
};
```

---

## Fitness Logic

### Issue #10: Add Warm-up Set Calculator
**Labels**: `enhancement`, `fitness-logic`
**Assignee**: Backend Team
**Milestone**: v1.2.0

#### Description
Users jump straight to working weight without warm-up sets, increasing injury risk.

#### Proposed Implementation
```typescript
const generateWarmupSets = (workingWeight: number): WarmupSet[] => {
  if (workingWeight < 40) return [];
  
  return [
    { weight: 'bar', reps: 10 },
    { weight: workingWeight * 0.4, reps: 8 },
    { weight: workingWeight * 0.6, reps: 5 },
    { weight: workingWeight * 0.8, reps: 3 },
  ];
};
```

---

## Testing

### Issue #11: Add Critical Path E2E Tests
**Labels**: `testing`, `quality`
**Assignee**: QA Team
**Milestone**: v1.2.0

#### Description
No automated tests exist. Need minimum coverage for critical paths.

#### Required Tests
1. User can register and login
2. User can complete a workout
3. Data persists across sessions
4. Offline mode doesn't crash
5. Unit conversion works correctly

#### Framework
Use Jest + React Native Testing Library:
```json
{
  "scripts": {
    "test": "jest",
    "test:e2e": "detox test"
  }
}
```

---

## Documentation

### Issue #12: Create User Documentation
**Labels**: `documentation`, `help-wanted`
**Assignee**: Technical Writer
**Milestone**: v1.3.0

#### Required Documentation
1. Getting Started Guide
2. Exercise Form Videos/Guides
3. Program Explanations
4. Troubleshooting FAQ
5. Glossary of Terms (RPE, 1RM, etc.)

---

## Monitoring

### Issue #13: Add Error Tracking
**Labels**: `enhancement`, `monitoring`
**Assignee**: DevOps Team
**Milestone**: v1.1.0

#### Description
Currently no visibility into production errors and crashes.

#### Proposed Solution
Integrate Sentry:
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  beforeSend(event) {
    // Sanitize PII
    return event;
  }
});
```

---

## Accessibility

### Issue #14: Add Screen Reader Support
**Labels**: `accessibility`, `high-priority`
**Assignee**: Frontend Team
**Milestone**: v1.2.0

#### Description
App is completely unusable with VoiceOver/TalkBack enabled.

#### Required Changes
- Add accessibilityLabel to all interactive elements
- Add accessibilityHint for complex interactions
- Test with VoiceOver (iOS) and TalkBack (Android)
- Ensure minimum 44px touch targets
- Fix contrast ratios (<4.5:1 found)

---

## Performance

### Issue #15: Implement Exercise List Virtualization
**Labels**: `performance`, `enhancement`
**Assignee**: Frontend Team
**Milestone**: v1.1.0

#### Description
Loading 300+ exercises at once causes severe performance issues.

#### Proposed Solution
Use FlatList with optimization:
```typescript
<FlatList
  data={exercises}
  renderItem={renderExercise}
  getItemLayout={getItemLayout}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews={true}
/>
```

---

## Notes for GitHub Integration

When `GITHUB_TOKEN` is available, create issues with:
```bash
gh issue create \
  --title "Remove Authentication Bypass" \
  --body "$(cat issue-1.md)" \
  --label "bug,security,critical" \
  --assignee "@security-team" \
  --milestone "v1.0.1"
```

Priority Order:
1. Security issues (1-2)
2. Performance issues (3)
3. Data integrity (4-5)
4. UX improvements (6-7)
5. Code quality (8-9)
6. Feature additions (10+)