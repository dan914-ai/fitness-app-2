# Fitness App - Database Schema Documentation

## Database Overview

The fitness app uses a relational database with the User entity as the central hub. All features organically connect through foreign key relationships, ensuring data integrity and efficient querying.

## Core Tables

### 1. Users
**Primary table that connects all app features**

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(500),
    instagram_username VARCHAR(50),
    tier ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond', 'challenger') DEFAULT 'bronze',
    points INT DEFAULT 0,
    is_pro BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'ko',
    weight_unit ENUM('kg', 'lbs') DEFAULT 'kg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
```

### 2. Workouts
**Stores individual workout sessions**

```sql
CREATE TABLE workouts (
    workout_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    workout_name VARCHAR(255),
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_minutes INT,
    total_volume_kg DECIMAL(10,2),
    calories_burned INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_workouts_user_date ON workouts(user_id, started_at);
CREATE INDEX idx_workouts_shared ON workouts(is_shared);
```

### 3. Exercises
**Master list of all exercises**

```sql
CREATE TABLE exercises (
    exercise_id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_name_ko VARCHAR(100) NOT NULL,
    exercise_name_en VARCHAR(100) NOT NULL,
    muscle_group_id INT NOT NULL,
    equipment_type ENUM('barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other'),
    difficulty ENUM('beginner', 'intermediate', 'advanced'),
    instructions_ko TEXT,
    instructions_en TEXT,
    image_url VARCHAR(500),
    animation_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(muscle_group_id)
);

CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group_id);
CREATE INDEX idx_exercises_name ON exercises(exercise_name_ko, exercise_name_en);
```

### 4. Muscle Groups
**Categories for exercises**

```sql
CREATE TABLE muscle_groups (
    muscle_group_id INT PRIMARY KEY AUTO_INCREMENT,
    group_name_ko VARCHAR(50) NOT NULL,
    group_name_en VARCHAR(50) NOT NULL,
    body_part ENUM('upper', 'lower', 'core'),
    color_code VARCHAR(7) -- For UI visualization
);

-- Predefined muscle groups
INSERT INTO muscle_groups (group_name_ko, group_name_en, body_part) VALUES
('가슴', 'chest', 'upper'),
('등', 'back', 'upper'),
('어깨', 'shoulders', 'upper'),
('팔', 'arms', 'upper'),
('다리', 'legs', 'lower'),
('코어', 'core', 'core');
```

### 5. Workout Exercises
**Junction table linking workouts to exercises**

```sql
CREATE TABLE workout_exercises (
    workout_exercise_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workout_id BIGINT NOT NULL,
    exercise_id INT NOT NULL,
    exercise_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id),
    UNIQUE KEY unique_workout_exercise_order (workout_id, exercise_order)
);

CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
```

### 6. Exercise Sets
**Individual sets within exercises**

```sql
CREATE TABLE exercise_sets (
    set_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workout_exercise_id BIGINT NOT NULL,
    set_number INT NOT NULL,
    weight_kg DECIMAL(6,2),
    reps INT,
    rest_seconds INT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    rpe INT CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
    FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(workout_exercise_id) ON DELETE CASCADE
);

CREATE INDEX idx_exercise_sets_workout_exercise ON exercise_sets(workout_exercise_id);
```

### 7. Body Metrics
**Tracks body measurements over time**

```sql
CREATE TABLE body_metrics (
    metric_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    recorded_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, recorded_date)
);

CREATE INDEX idx_body_metrics_user_date ON body_metrics(user_id, recorded_date);
```

### 8. Progress Photos
**Stores user progress photos**

```sql
CREATE TABLE progress_photos (
    photo_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    photo_date DATE NOT NULL,
    photo_type ENUM('front', 'side', 'back', 'other'),
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_progress_photos_user_date ON progress_photos(user_id, photo_date);
```

### 9. Workout Programs
**Pre-defined or AI-generated programs**

```sql
CREATE TABLE workout_programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    program_name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty ENUM('beginner', 'intermediate', 'advanced'),
    duration_weeks INT,
    created_by ENUM('system', 'ai', 'user'),
    creator_user_id BIGINT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
```

### 10. User Programs
**Links users to programs they're following**

```sql
CREATE TABLE user_programs (
    user_program_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    program_id INT NOT NULL,
    started_date DATE NOT NULL,
    completed_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES workout_programs(program_id)
);
```

### 11. Social Posts
**User-generated content feed**

```sql
CREATE TABLE social_posts (
    post_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    post_type ENUM('workout', 'photo', 'achievement', 'text'),
    content TEXT,
    workout_id BIGINT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE
);

CREATE INDEX idx_social_posts_user ON social_posts(user_id);
CREATE INDEX idx_social_posts_created ON social_posts(created_at);
```

### 12. Post Likes
**Tracks likes on social posts**

```sql
CREATE TABLE post_likes (
    like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction_type ENUM('like', 'fire', 'strong') DEFAULT 'like',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post_like (user_id, post_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
```

### 13. Comments
**Comments on social posts**

```sql
CREATE TABLE comments (
    comment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_post ON comments(post_id);
```

### 14. User Follows
**Social following relationships**

```sql
CREATE TABLE user_follows (
    follow_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    follower_user_id BIGINT NOT NULL,
    following_user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_user_id, following_user_id),
    CHECK (follower_user_id != following_user_id)
);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_user_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_user_id);
```

### 15. Exercise Records (1RM)
**Tracks personal records**

```sql
CREATE TABLE exercise_records (
    record_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    exercise_id INT NOT NULL,
    record_type ENUM('1rm', 'max_volume', 'max_reps'),
    record_value DECIMAL(8,2) NOT NULL,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);

CREATE INDEX idx_exercise_records_user_exercise ON exercise_records(user_id, exercise_id);
```

### 16. User Settings
**Stores user preferences**

```sql
CREATE TABLE user_settings (
    user_id BIGINT PRIMARY KEY,
    rest_timer_enabled BOOLEAN DEFAULT TRUE,
    default_rest_seconds INT DEFAULT 60,
    rest_timer_sound BOOLEAN DEFAULT TRUE,
    auto_progression BOOLEAN DEFAULT TRUE,
    muscle_image_gender ENUM('male', 'female') DEFAULT 'male',
    push_notifications BOOLEAN DEFAULT TRUE,
    workout_reminder_time TIME,
    social_notifications BOOLEAN DEFAULT TRUE,
    week_starts_on ENUM('sunday', 'monday') DEFAULT 'monday',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### 17. Notifications
**Push notification history**

```sql
CREATE TABLE notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    notification_type ENUM('workout_reminder', 'social', 'achievement', 'friend_request'),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

### 18. Achievements
**Gamification achievements**

```sql
CREATE TABLE achievements (
    achievement_id INT PRIMARY KEY AUTO_INCREMENT,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    points_value INT NOT NULL,
    icon_url VARCHAR(500)
);

CREATE TABLE user_achievements (
    user_achievement_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    achievement_id INT NOT NULL,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id),
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);
```

### 19. Cardio Sessions
**Tracks cardio workouts**

```sql
CREATE TABLE cardio_sessions (
    cardio_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    workout_id BIGINT,
    activity_type ENUM('running', 'cycling', 'swimming', 'other'),
    duration_minutes INT NOT NULL,
    distance_km DECIMAL(6,2),
    calories_burned INT,
    average_heart_rate INT,
    average_speed_kmh DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE
);
```

### 20. Workout Templates
**User-created workout templates**

```sql
CREATE TABLE workout_templates (
    template_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE template_exercises (
    template_exercise_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT NOT NULL,
    exercise_id INT NOT NULL,
    exercise_order INT NOT NULL,
    default_sets INT,
    default_reps INT,
    default_weight_kg DECIMAL(6,2),
    FOREIGN KEY (template_id) REFERENCES workout_templates(template_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);
```

## Data Relationships Summary

### User-Centric Design
All major features connect through the `user_id`:
- **Workouts**: One user has many workouts
- **Body Metrics**: One user has many measurements
- **Social**: Users create posts, like content, follow others
- **Programs**: Users can follow multiple programs
- **Settings**: One-to-one relationship with users

### Workout Structure
```
User → Workouts → Workout_Exercises → Exercise_Sets
                ↓
             Exercises → Muscle_Groups
```

### Social Structure
```
User → Social_Posts → Post_Likes
                    → Comments
     → User_Follows (self-referencing many-to-many)
```

### Achievement System
```
User → User_Achievements ← Achievements
     → Points/Tier (calculated from achievements)
```

## Indexes Strategy

1. **Primary Keys**: All tables have auto-incrementing primary keys
2. **Foreign Keys**: Indexed for join performance
3. **Composite Indexes**: User+Date combinations for time-based queries
4. **Search Indexes**: Username, exercise names for quick lookups
5. **Filtering Indexes**: is_shared, is_active for common WHERE clauses

## Data Integrity Rules

1. **Cascading Deletes**: User deletion removes all related data
2. **Unique Constraints**: Prevent duplicate follows, likes, etc.
3. **Check Constraints**: Validate ratings, RPE values
4. **Default Values**: Sensible defaults for optional fields
5. **Timestamp Tracking**: created_at and updated_at for auditing

## Performance Considerations

1. **Partitioning**: Consider partitioning large tables (workouts, exercise_sets) by date
2. **Archiving**: Move old workout data to archive tables
3. **Caching**: Frequently accessed data (exercise list, muscle groups)
4. **Read Replicas**: For statistics and analytics queries
5. **Connection Pooling**: Manage database connections efficiently