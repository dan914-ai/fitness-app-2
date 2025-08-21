# System Diagrams

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph "Mobile App"
        UI[UI Layer]
        NAV[Navigation]
        CTX[Context Layer]
        SVC[Service Layer]
        STOR[Storage Layer]
    end
    
    subgraph "Backend Services"
        SUP[Supabase]
        AUTH[Auth Service]
        DB[(PostgreSQL)]
        STORAGE[File Storage]
    end
    
    subgraph "Local Storage"
        ASYNC[AsyncStorage]
        CACHE[Image Cache]
        QUEUE[Sync Queue]
    end
    
    UI --> NAV
    NAV --> CTX
    CTX --> SVC
    SVC --> STOR
    STOR --> ASYNC
    STOR --> SUP
    SUP --> AUTH
    SUP --> DB
    SUP --> STORAGE
    SVC --> CACHE
    SVC --> QUEUE
```

## 2. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant AuthService
    participant AsyncStorage
    participant Supabase
    
    User->>App: Launch App
    App->>AsyncStorage: Check stored token
    
    alt Token exists
        AsyncStorage-->>App: Return token
        App->>Supabase: Verify token
        alt Token valid
            Supabase-->>App: User data
            App->>User: Show Main App
        else Token invalid
            Supabase-->>App: Error
            App->>User: Show Login
        end
    else No token
        AsyncStorage-->>App: Null
        App->>User: Show Login
    end
    
    User->>App: Enter credentials
    App->>AuthService: Login request
    AuthService->>Supabase: Authenticate
    Supabase-->>AuthService: Session + Token
    AuthService->>AsyncStorage: Store token
    AuthService-->>App: Success
    App->>User: Show Main App
```

## 3. Workout Session Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Starting: Start Workout
    Starting --> Active: Initialize Context
    
    Active --> AddingExercise: Add Exercise
    AddingExercise --> Active: Exercise Added
    
    Active --> TrackingSet: Start Set
    TrackingSet --> RestTimer: Complete Set
    RestTimer --> TrackingSet: Rest Complete
    TrackingSet --> Active: All Sets Done
    
    Active --> Saving: End Workout
    Saving --> Syncing: Save to Storage
    Syncing --> Complete: Show Summary
    Complete --> [*]
    
    Active --> Paused: Pause
    Paused --> Active: Resume
    Paused --> Cancelled: Cancel
    Cancelled --> [*]
```

## 4. Data Sync Architecture

```mermaid
graph LR
    subgraph "User Actions"
        A1[Create Workout]
        A2[Update Exercise]
        A3[Delete Routine]
    end
    
    subgraph "Sync Manager"
        CHECK{Network?}
        QUEUE[Sync Queue]
        SYNC[Sync Service]
    end
    
    subgraph "Storage"
        LOCAL[AsyncStorage]
        REMOTE[Supabase]
    end
    
    A1 --> CHECK
    A2 --> CHECK
    A3 --> CHECK
    
    CHECK -->|Online| SYNC
    CHECK -->|Offline| QUEUE
    
    SYNC --> LOCAL
    SYNC --> REMOTE
    
    QUEUE --> LOCAL
    QUEUE -.->|When Online| SYNC
```

## 5. Component Hierarchy

```mermaid
graph TD
    APP[App.tsx]
    APP --> ERROR[ErrorBoundary]
    ERROR --> THEME[ThemeProvider]
    THEME --> AUTH[AuthProvider]
    AUTH --> WORK[WorkoutProvider]
    
    WORK --> NAV[AppNavigator]
    
    NAV --> AUTHSTACK[AuthStack]
    NAV --> MAINTABS[MainTabs]
    
    AUTHSTACK --> LOGIN[LoginScreen]
    AUTHSTACK --> REGISTER[RegisterScreen]
    
    MAINTABS --> HOME[HomeTab]
    MAINTABS --> RECORD[RecordTab]
    MAINTABS --> STATS[StatsTab]
    MAINTABS --> MENU[MenuTab]
    
    HOME --> HOMESCREEN[HomeScreen]
    HOME --> WORKOUT[WorkoutSessionScreen]
    HOME --> EXERCISE[ExerciseTrackScreen]
    HOME --> COMPLETE[WorkoutCompleteScreen]
```

## 6. Service Layer Architecture

```mermaid
graph TB
    subgraph "Core Services"
        AUTH_SVC[AuthService]
        WORK_SVC[WorkoutService]
        EX_SVC[ExerciseService]
    end
    
    subgraph "Support Services"
        STOR_SVC[StorageService]
        NET_SVC[NetworkService]
        SYNC_SVC[SyncService]
    end
    
    subgraph "Feature Services"
        TIMER_SVC[TimerService]
        ANAL_SVC[AnalyticsService]
        NOTIF_SVC[NotificationService]
    end
    
    subgraph "Data Layer"
        ASYNC[AsyncStorage]
        SUPA[Supabase Client]
        CACHE[Cache Manager]
    end
    
    AUTH_SVC --> STOR_SVC
    AUTH_SVC --> SUPA
    
    WORK_SVC --> STOR_SVC
    WORK_SVC --> SYNC_SVC
    
    EX_SVC --> CACHE
    EX_SVC --> STOR_SVC
    
    STOR_SVC --> ASYNC
    SYNC_SVC --> NET_SVC
    SYNC_SVC --> SUPA
    
    NET_SVC --> SUPA
```

## 7. State Management Flow

```mermaid
graph LR
    subgraph "User Interface"
        SCREEN[Screen Component]
        UI[UI Component]
    end
    
    subgraph "State Management"
        HOOK[useWorkout Hook]
        CTX[WorkoutContext]
        REDUCER[State Reducer]
    end
    
    subgraph "Persistence"
        LOCAL[Local State]
        STORAGE[AsyncStorage]
        REMOTE[Supabase]
    end
    
    UI --> |dispatch| HOOK
    HOOK --> CTX
    CTX --> REDUCER
    REDUCER --> LOCAL
    
    LOCAL --> |persist| STORAGE
    STORAGE --> |sync| REMOTE
    
    LOCAL --> |update| UI
```

## 8. Navigation Structure

```mermaid
graph TD
    ROOT[Root Navigator]
    
    ROOT --> AUTH{Authenticated?}
    
    AUTH -->|No| AUTHSTACK[Auth Stack]
    AUTH -->|Yes| MAINTABS[Main Tabs]
    
    AUTHSTACK --> LOGIN[Login]
    AUTHSTACK --> REGISTER[Register]
    
    MAINTABS --> HOME[Home Stack]
    MAINTABS --> RECORD[Record Stack]
    MAINTABS --> STATS[Stats Stack]
    MAINTABS --> MENU[Menu Stack]
    
    HOME --> HOMESCREEN[Home Screen]
    HOME --> ROUTINE[Routine Detail]
    HOME --> SESSION[Workout Session]
    HOME --> TRACK[Exercise Track]
    HOME --> SUMMARY[Workout Complete]
    
    RECORD --> HISTORY[Workout History]
    RECORD --> EXHISTORY[Exercise History]
    RECORD --> BODY[Body Measurements]
    
    STATS --> DASHBOARD[Stats Dashboard]
    STATS --> PROGRESS[Progress Charts]
    STATS --> ACHIEVEMENTS[Achievements]
    
    MENU --> PROFILE[Profile]
    MENU --> SETTINGS[Settings]
    MENU --> PROGRAMS[Workout Programs]
```

## 9. Error Handling Flow

```mermaid
flowchart TD
    START[User Action]
    START --> TRY{Try Operation}
    
    TRY -->|Success| SUCCESS[Update UI]
    TRY -->|Network Error| NETWORK[Check Network]
    TRY -->|Auth Error| AUTH[Refresh Token]
    TRY -->|Data Error| VALIDATE[Validate Data]
    TRY -->|Unknown Error| LOG[Log Error]
    
    NETWORK -->|Offline| QUEUE[Add to Queue]
    NETWORK -->|Online| RETRY[Retry Operation]
    
    AUTH -->|Success| RETRY
    AUTH -->|Fail| LOGIN[Show Login]
    
    VALIDATE -->|Fix| RETRY
    VALIDATE -->|Can't Fix| ERROR[Show Error]
    
    LOG --> ERROR
    QUEUE --> OFFLINE[Continue Offline]
    
    RETRY -->|Success| SUCCESS
    RETRY -->|Fail| ERROR
    
    SUCCESS --> END[Complete]
    ERROR --> END
    OFFLINE --> END
    LOGIN --> END
```

## 10. Performance Optimization Strategy

```mermaid
graph TD
    subgraph "Rendering Optimization"
        MEMO[React.memo]
        CALLBACK[useCallback]
        USEMEMO[useMemo]
    end
    
    subgraph "Data Optimization"
        LAZY[Lazy Loading]
        VIRTUAL[Virtual Lists]
        CACHE[Data Caching]
    end
    
    subgraph "Asset Optimization"
        STATIC[Static Imports]
        COMPRESS[Image Compression]
        BUNDLE[Code Splitting]
    end
    
    subgraph "Network Optimization"
        BATCH[Batch Requests]
        DEBOUNCE[Debounce]
        PREFETCH[Prefetch]
    end
    
    COMPONENTS[Components] --> MEMO
    HANDLERS[Event Handlers] --> CALLBACK
    CALCULATIONS[Heavy Calculations] --> USEMEMO
    
    LISTS[Large Lists] --> VIRTUAL
    IMAGES[Images] --> LAZY
    DATA[API Data] --> CACHE
    
    THUMBNAILS[Thumbnails] --> STATIC
    PHOTOS[Photos] --> COMPRESS
    FEATURES[Features] --> BUNDLE
    
    API[API Calls] --> BATCH
    SEARCH[Search] --> DEBOUNCE
    NAVIGATION[Navigation] --> PREFETCH
```

## 11. Database Schema

```mermaid
erDiagram
    Users ||--o{ Workouts : has
    Users ||--o{ Routines : creates
    Users ||--o{ PersonalRecords : achieves
    Users ||--o{ Achievements : unlocks
    Users ||--o{ Settings : configures
    
    Workouts ||--o{ WorkoutExercises : contains
    Workouts }o--|| Routines : based_on
    
    WorkoutExercises }o--|| Exercises : references
    WorkoutExercises ||--o{ Sets : includes
    
    Exercises ||--o{ PersonalRecords : tracked_in
    Exercises }o--|| Categories : belongs_to
    Exercises }o--|| Equipment : uses
    
    Routines ||--o{ RoutineExercises : includes
    RoutineExercises }o--|| Exercises : references
    
    Users {
        uuid id PK
        string email
        string name
        timestamp created_at
    }
    
    Workouts {
        uuid id PK
        uuid user_id FK
        uuid routine_id FK
        timestamp start_time
        timestamp end_time
        float total_volume
        json exercises
    }
    
    Exercises {
        int id PK
        string name
        string category
        string equipment
        string thumbnail
    }
```

## 12. Deployment Pipeline

```mermaid
flowchart LR
    subgraph "Development"
        DEV[Local Dev]
        TEST[Testing]
    end
    
    subgraph "Build Process"
        LINT[Linting]
        TYPE[TypeCheck]
        BUILD[Build]
    end
    
    subgraph "Deployment"
        STAGE[Staging]
        PROD[Production]
    end
    
    subgraph "Distribution"
        IOS[App Store]
        ANDROID[Play Store]
    end
    
    DEV --> TEST
    TEST --> LINT
    LINT --> TYPE
    TYPE --> BUILD
    
    BUILD --> STAGE
    STAGE --> PROD
    
    PROD --> IOS
    PROD --> ANDROID
```