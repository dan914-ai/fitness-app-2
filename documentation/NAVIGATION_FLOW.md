# Fitness App - Navigation Flow Documentation

## Navigation Architecture

### Primary Navigation
**Bottom Tab Bar** (Always visible)
```
[홈] [기록] [통계] [소셜] [메뉴]
 |     |      |      |      |
Home Records Stats Social Menu
```

## Screen Navigation Flows

### 1. 홈 (Home) Navigation

#### Home Dashboard → Quick Actions
```
홈 (Home)
├── 빠른기록 (Quick Record) → Exercise Selection Screen
├── 플릭AI (Flick AI) → AI Program Generation
└── 프로그램 (Programs) → Program List
```

#### Workout Flow
```
내 루틴 (My Routine)
└── Routine Card Click
    └── Exercise List View
        ├── 시작 (Start) Button
        │   └── Active Workout Screen
        │       ├── Exercise Detail View
        │       │   ├── Set/Rep/Weight Grid
        │       │   ├── Rest Timer
        │       │   └── Complete Set → Next Set
        │       ├── 운동 추가 (Add Exercise)
        │       │   └── Exercise Search/Selection
        │       └── 운동 완료 (Complete Workout)
        │           └── Workout Summary
        │               ├── Rating (1-5 stars)
        │               ├── 공유하기 (Share) → Social Post
        │               └── 홈으로 (Home) → Home Dashboard
        └── + 운동 추가 (Add Exercise) Button
            └── Exercise Library
```

### 2. 기록 (Records) Navigation

#### Calendar Navigation
```
기록 (Records)
├── Tab Selection
│   ├── 운동 (Workouts)
│   ├── 포토 (Photos)
│   └── 신체 (Body)
├── Calendar Date Click
│   └── Day Detail View
│       ├── Workout Details (if workout day)
│       ├── Photos (if photo day)
│       └── Measurements (if body day)
└── + Button
    └── Add New Entry Modal
        ├── 운동 계획 추가 (Add Workout Plan)
        ├── 사진 추가 (Add Photo)
        └── 신체 기록 추가 (Add Body Measurement)
```

#### Historical Data Access
```
Workout Entry Click
└── Detailed Workout View
    ├── Exercise List
    ├── Sets/Reps/Weight Data
    ├── Total Volume
    ├── Duration
    └── Edit/Delete Options
```

### 3. 통계 (Statistics) Navigation

#### Statistics Views
```
통계 (Statistics)
├── Time Period Selector
│   ├── 7일 (7 days)
│   ├── 30일 (30 days)
│   ├── 90일 (90 days)
│   └── 전체기간 (All time)
├── Muscle Group Visualization
│   └── Click on Muscle → Filtered Exercise History
├── Volume Chart
│   └── Bar Click → Day/Week Details
└── Performance Metrics
    └── Metric Click → Detailed History
```

### 4. 소셜 (Social) Navigation

#### Social Feed Flow
```
소셜 (Social)
├── Tab Selection
│   ├── 검색 (Search)
│   ├── 3 팔로워 (Followers)
│   └── 4 팔로잉 (Following)
├── Post Interaction
│   ├── User Profile Click → User Profile Screen
│   ├── Like Button → Update Like Count
│   └── Comment → Comment Thread
└── + Button (Create Post)
    └── Post Creation Screen
        ├── 기록 (Record) → Select Workout to Share
        ├── 운동 (Exercise) → Exercise Content
        └── Photo → Camera/Gallery
```

#### User Profile Navigation
```
User Profile
├── 제거 (Remove) / Follow Button
├── View Posts
├── View Stats
└── Back to Feed
```

### 5. 메뉴 (Menu) Navigation

#### Profile Section
```
프로필 (Profile)
├── Edit Profile → Profile Edit Screen
├── 플릭 프로 (Pro) → Subscription Management
└── Instagram Link → External App
```

#### Tools Navigation
```
계산기 (Calculators)
├── 1RM 계산기 → 1RM Calculator Screen
│   └── Exercise Selection → Calculation View
├── 칼로리 계산기 → Calorie Calculator
└── 매크로 계산기 → Macro Calculator
```

#### Settings Flow
```
설정 (Settings)
├── 일반 설정 (General)
│   ├── 언어 설정 (Language)
│   ├── 무게 단위 (Weight Unit)
│   └── 주의 시작 요일 (Week Start)
├── 푸시 알림 설정 (Push Notifications)
│   ├── Toggle Switches
│   └── Notification Preferences
├── 운동/루틴 설정 (Exercise Settings)
│   ├── Various Toggle Options
│   └── Behavior Preferences
└── 휴식 타이머 설정 (Rest Timer)
    ├── Default Times
    ├── Sound Settings
    └── Display Options
```

#### Rankings Navigation
```
랭크 (Rankings)
└── Ranking Details Screen
    ├── Current Tier Display
    ├── Leaderboard View
    └── Exercise-Specific Rankings
```

## Modal/Overlay Patterns

### Common Modals
```
1. Exercise Selection Modal
   - Search bar
   - Category filters
   - Exercise list
   - Close (X) button

2. Rest Timer Overlay
   - Countdown display
   - Skip button
   - Minimize option

3. Confirmation Dialogs
   - Delete workout
   - Complete workout
   - Cancel action

4. Share Modal
   - Social platform selection
   - Caption input
   - Post button
```

## Navigation Gestures

### Swipe Gestures
- Calendar: Left/Right to change months
- Workout exercises: Swipe to delete
- Statistics charts: Left/Right for time periods

### Pull Actions
- Pull to refresh: Social feed, workout history
- Pull down to dismiss: Modals, overlays

## Deep Linking Structure

### URL Scheme
```
app://fitness/
├── home/
│   ├── workout/{workoutId}
│   └── program/{programId}
├── records/
│   ├── date/{yyyy-mm-dd}
│   └── workout/{workoutId}
├── stats/
│   └── period/{days}
├── social/
│   ├── post/{postId}
│   └── user/{userId}
└── menu/
    ├── calculator/{type}
    └── settings/{section}
```

## Navigation State Management

### Stack Management
- Each tab maintains its own navigation stack
- Tab switches preserve navigation state
- Back button behavior:
  - In stack: Pop to previous screen
  - At root: Exit app confirmation

### Data Persistence
- Form data saved on navigation
- Workout progress saved automatically
- Draft posts preserved

## Error States & Redirects

### Network Errors
- Show retry overlay
- Cache offline data
- Graceful degradation

### Authentication
- Redirect to login if needed
- Return to original destination after auth

### Empty States
- Provide action buttons
- Clear navigation to add content