# Fitness App REST API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Rate Limiting](#rate-limiting)
5. [Error Codes](#error-codes)
6. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#users-endpoints)
   - [Workouts](#workouts-endpoints)
   - [Exercises](#exercises-endpoints)
   - [Body Metrics](#body-metrics-endpoints)
   - [Progress Photos](#progress-photos-endpoints)
   - [Workout Programs](#workout-programs-endpoints)
   - [Social Features](#social-features-endpoints)
   - [Achievements](#achievements-endpoints)
   - [Cardio Sessions](#cardio-sessions-endpoints)
   - [Workout Templates](#workout-templates-endpoints)

## Overview

The Fitness App API is a RESTful API that provides access to all fitness tracking features including workouts, exercises, body metrics, social features, and more. All requests and responses are in JSON format.

## Base URL

```
https://api.fitnessapp.com/v1
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the JWT token in the Authorization header for all authenticated requests.

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Register New User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "language": "en",
  "weight_unit": "kg"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "user_id": 12345,
    "username": "johndoe",
    "email": "john@example.com",
    "tier": "bronze",
    "points": 0,
    "is_pro": false,
    "language": "en",
    "weight_unit": "kg",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "user_id": 12345,
    "username": "johndoe",
    "email": "john@example.com",
    "tier": "silver",
    "points": 1250,
    "is_pro": true,
    "last_login": "2024-01-15T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

## Rate Limiting

API rate limits are enforced to ensure fair usage:

| Tier | Requests per Hour | Burst Limit |
|------|------------------|-------------|
| Free (Bronze) | 100 | 20/minute |
| Silver | 500 | 50/minute |
| Gold | 1000 | 100/minute |
| Platinum+ | 5000 | 200/minute |
| Pro Users | 10000 | 500/minute |

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1673784000
```

## Error Codes

The API uses standard HTTP status codes and returns detailed error messages:

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Access denied to resource |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

**Error Response Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## API Endpoints

### Users Endpoints

#### Get Current User Profile
```http
GET /users/me
```

**Response (200 OK):**
```json
{
  "user_id": 12345,
  "username": "johndoe",
  "email": "john@example.com",
  "profile_image_url": "https://cdn.fitnessapp.com/users/12345/profile.jpg",
  "instagram_username": "@johndoe",
  "tier": "gold",
  "points": 5420,
  "is_pro": true,
  "language": "en",
  "weight_unit": "kg",
  "created_at": "2023-01-15T10:00:00Z",
  "stats": {
    "total_workouts": 245,
    "total_volume": 125420.5,
    "followers": 89,
    "following": 124
  }
}
```

#### Update User Profile
```http
PUT /users/me
```

**Request Body:**
```json
{
  "username": "johndoe_fit",
  "instagram_username": "@johndoe_fit",
  "language": "ko",
  "weight_unit": "lbs"
}
```

**Response (200 OK):**
```json
{
  "user_id": 12345,
  "username": "johndoe_fit",
  "instagram_username": "@johndoe_fit",
  "language": "ko",
  "weight_unit": "lbs",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

#### Upload Profile Image
```http
POST /users/me/profile-image
```

**Request:**
```
Content-Type: multipart/form-data
image: <binary-data>
```

**Response (200 OK):**
```json
{
  "profile_image_url": "https://cdn.fitnessapp.com/users/12345/profile-new.jpg"
}
```

#### Get User by ID
```http
GET /users/{user_id}
```

**Response (200 OK):**
```json
{
  "user_id": 67890,
  "username": "janedoe",
  "profile_image_url": "https://cdn.fitnessapp.com/users/67890/profile.jpg",
  "instagram_username": "@janedoe",
  "tier": "platinum",
  "points": 8920,
  "is_following": false,
  "stats": {
    "total_workouts": 420,
    "followers": 256,
    "following": 189
  }
}
```

#### Update User Settings
```http
PUT /users/me/settings
```

**Request Body:**
```json
{
  "rest_timer_enabled": true,
  "default_rest_seconds": 90,
  "rest_timer_sound": false,
  "auto_progression": true,
  "muscle_image_gender": "female",
  "push_notifications": true,
  "workout_reminder_time": "07:00:00",
  "social_notifications": true,
  "week_starts_on": "monday"
}
```

**Response (200 OK):**
```json
{
  "message": "Settings updated successfully",
  "settings": {
    "rest_timer_enabled": true,
    "default_rest_seconds": 90,
    "rest_timer_sound": false,
    "auto_progression": true,
    "muscle_image_gender": "female",
    "push_notifications": true,
    "workout_reminder_time": "07:00:00",
    "social_notifications": true,
    "week_starts_on": "monday",
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

### Workouts Endpoints

#### Create Workout
```http
POST /workouts
```

**Request Body:**
```json
{
  "workout_name": "Chest and Triceps",
  "started_at": "2024-01-15T10:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "workout_id": 98765,
  "user_id": 12345,
  "workout_name": "Chest and Triceps",
  "started_at": "2024-01-15T10:00:00Z",
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### Get User Workouts
```http
GET /workouts
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `start_date` (string): Filter by start date (YYYY-MM-DD)
- `end_date` (string): Filter by end date (YYYY-MM-DD)
- `is_shared` (boolean): Filter by shared status

**Response (200 OK):**
```json
{
  "workouts": [
    {
      "workout_id": 98765,
      "workout_name": "Chest and Triceps",
      "started_at": "2024-01-15T10:00:00Z",
      "completed_at": "2024-01-15T11:30:00Z",
      "duration_minutes": 90,
      "total_volume_kg": 5420.50,
      "calories_burned": 450,
      "rating": 4,
      "is_shared": true,
      "exercise_count": 6
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "total_pages": 13
  }
}
```

#### Get Workout Details
```http
GET /workouts/{workout_id}
```

**Response (200 OK):**
```json
{
  "workout_id": 98765,
  "user_id": 12345,
  "workout_name": "Chest and Triceps",
  "started_at": "2024-01-15T10:00:00Z",
  "completed_at": "2024-01-15T11:30:00Z",
  "duration_minutes": 90,
  "total_volume_kg": 5420.50,
  "calories_burned": 450,
  "rating": 4,
  "notes": "Great pump! Increased bench press weight",
  "is_shared": true,
  "exercises": [
    {
      "workout_exercise_id": 11111,
      "exercise_id": 1,
      "exercise_order": 1,
      "exercise": {
        "exercise_name_en": "Barbell Bench Press",
        "muscle_group": "chest",
        "equipment_type": "barbell"
      },
      "sets": [
        {
          "set_id": 22222,
          "set_number": 1,
          "weight_kg": 60.0,
          "reps": 12,
          "rest_seconds": 90,
          "is_completed": true,
          "completed_at": "2024-01-15T10:05:00Z",
          "rpe": 7
        }
      ]
    }
  ]
}
```

#### Update Workout
```http
PUT /workouts/{workout_id}
```

**Request Body:**
```json
{
  "workout_name": "Chest and Triceps - PR Day!",
  "completed_at": "2024-01-15T11:45:00Z",
  "rating": 5,
  "notes": "New bench press PR! 100kg x 5 reps",
  "is_shared": true
}
```

**Response (200 OK):**
```json
{
  "workout_id": 98765,
  "workout_name": "Chest and Triceps - PR Day!",
  "completed_at": "2024-01-15T11:45:00Z",
  "duration_minutes": 105,
  "rating": 5,
  "notes": "New bench press PR! 100kg x 5 reps",
  "is_shared": true
}
```

#### Delete Workout
```http
DELETE /workouts/{workout_id}
```

**Response (204 No Content)**

#### Add Exercise to Workout
```http
POST /workouts/{workout_id}/exercises
```

**Request Body:**
```json
{
  "exercise_id": 5,
  "exercise_order": 2
}
```

**Response (201 Created):**
```json
{
  "workout_exercise_id": 33333,
  "workout_id": 98765,
  "exercise_id": 5,
  "exercise_order": 2,
  "exercise": {
    "exercise_name_en": "Dumbbell Flyes",
    "muscle_group": "chest",
    "equipment_type": "dumbbell"
  }
}
```

#### Add Set to Exercise
```http
POST /workouts/{workout_id}/exercises/{workout_exercise_id}/sets
```

**Request Body:**
```json
{
  "set_number": 2,
  "weight_kg": 65.0,
  "reps": 10,
  "rest_seconds": 90,
  "rpe": 8
}
```

**Response (201 Created):**
```json
{
  "set_id": 44444,
  "workout_exercise_id": 11111,
  "set_number": 2,
  "weight_kg": 65.0,
  "reps": 10,
  "rest_seconds": 90,
  "is_completed": false,
  "rpe": 8
}
```

#### Update Set
```http
PUT /workouts/{workout_id}/exercises/{workout_exercise_id}/sets/{set_id}
```

**Request Body:**
```json
{
  "is_completed": true,
  "completed_at": "2024-01-15T10:15:00Z",
  "rpe": 9
}
```

**Response (200 OK):**
```json
{
  "set_id": 44444,
  "is_completed": true,
  "completed_at": "2024-01-15T10:15:00Z",
  "rpe": 9
}
```

### Exercises Endpoints

#### Get All Exercises
```http
GET /exercises
```

**Query Parameters:**
- `muscle_group_id` (integer): Filter by muscle group
- `equipment_type` (string): Filter by equipment type
- `difficulty` (string): Filter by difficulty
- `search` (string): Search by name
- `language` (string): Language for exercise names (en/ko)

**Response (200 OK):**
```json
{
  "exercises": [
    {
      "exercise_id": 1,
      "exercise_name_en": "Barbell Bench Press",
      "exercise_name_ko": "바벨 벤치프레스",
      "muscle_group": {
        "muscle_group_id": 1,
        "group_name_en": "chest",
        "group_name_ko": "가슴",
        "body_part": "upper"
      },
      "equipment_type": "barbell",
      "difficulty": "intermediate",
      "image_url": "https://cdn.fitnessapp.com/exercises/1/image.jpg",
      "animation_url": "https://cdn.fitnessapp.com/exercises/1/animation.gif"
    }
  ],
  "total": 150
}
```

#### Get Exercise Details
```http
GET /exercises/{exercise_id}
```

**Response (200 OK):**
```json
{
  "exercise_id": 1,
  "exercise_name_en": "Barbell Bench Press",
  "exercise_name_ko": "바벨 벤치프레스",
  "muscle_group": {
    "muscle_group_id": 1,
    "group_name_en": "chest",
    "group_name_ko": "가슴",
    "body_part": "upper",
    "color_code": "#FF6B6B"
  },
  "equipment_type": "barbell",
  "difficulty": "intermediate",
  "instructions_en": "1. Lie on bench\n2. Grip bar slightly wider than shoulders\n3. Lower bar to chest\n4. Press up explosively",
  "instructions_ko": "1. 벤치에 누우세요\n2. 어깨보다 약간 넓게 바를 잡으세요\n3. 가슴까지 바를 내리세요\n4. 폭발적으로 밀어올리세요",
  "image_url": "https://cdn.fitnessapp.com/exercises/1/image.jpg",
  "animation_url": "https://cdn.fitnessapp.com/exercises/1/animation.gif",
  "user_records": {
    "1rm": 100.0,
    "max_volume": 5420.0,
    "max_reps": 15
  }
}
```

#### Get Muscle Groups
```http
GET /muscle-groups
```

**Response (200 OK):**
```json
{
  "muscle_groups": [
    {
      "muscle_group_id": 1,
      "group_name_en": "chest",
      "group_name_ko": "가슴",
      "body_part": "upper",
      "color_code": "#FF6B6B"
    },
    {
      "muscle_group_id": 2,
      "group_name_en": "back",
      "group_name_ko": "등",
      "body_part": "upper",
      "color_code": "#4ECDC4"
    }
  ]
}
```

### Body Metrics Endpoints

#### Record Body Metrics
```http
POST /body-metrics
```

**Request Body:**
```json
{
  "recorded_date": "2024-01-15",
  "weight_kg": 75.5,
  "body_fat_percentage": 15.2,
  "muscle_mass_kg": 32.1
}
```

**Response (201 Created):**
```json
{
  "metric_id": 55555,
  "user_id": 12345,
  "recorded_date": "2024-01-15",
  "weight_kg": 75.5,
  "body_fat_percentage": 15.2,
  "muscle_mass_kg": 32.1,
  "created_at": "2024-01-15T08:00:00Z"
}
```

#### Get Body Metrics History
```http
GET /body-metrics
```

**Query Parameters:**
- `start_date` (string): Filter by start date
- `end_date` (string): Filter by end date
- `limit` (integer): Number of records (default: 30)

**Response (200 OK):**
```json
{
  "metrics": [
    {
      "metric_id": 55555,
      "recorded_date": "2024-01-15",
      "weight_kg": 75.5,
      "body_fat_percentage": 15.2,
      "muscle_mass_kg": 32.1
    },
    {
      "metric_id": 55554,
      "recorded_date": "2024-01-08",
      "weight_kg": 76.0,
      "body_fat_percentage": 15.5,
      "muscle_mass_kg": 31.8
    }
  ],
  "summary": {
    "weight_change": -0.5,
    "body_fat_change": -0.3,
    "muscle_mass_change": 0.3,
    "period_days": 7
  }
}
```

#### Update Body Metric
```http
PUT /body-metrics/{metric_id}
```

**Request Body:**
```json
{
  "weight_kg": 75.3,
  "body_fat_percentage": 15.0
}
```

**Response (200 OK):**
```json
{
  "metric_id": 55555,
  "recorded_date": "2024-01-15",
  "weight_kg": 75.3,
  "body_fat_percentage": 15.0,
  "muscle_mass_kg": 32.1
}
```

#### Delete Body Metric
```http
DELETE /body-metrics/{metric_id}
```

**Response (204 No Content)**

### Progress Photos Endpoints

#### Upload Progress Photo
```http
POST /progress-photos
```

**Request:**
```
Content-Type: multipart/form-data
photo: <binary-data>
photo_date: "2024-01-15"
photo_type: "front"
is_private: false
```

**Response (201 Created):**
```json
{
  "photo_id": 66666,
  "user_id": 12345,
  "photo_url": "https://cdn.fitnessapp.com/progress/12345/66666.jpg",
  "photo_date": "2024-01-15",
  "photo_type": "front",
  "is_private": false,
  "created_at": "2024-01-15T09:00:00Z"
}
```

#### Get Progress Photos
```http
GET /progress-photos
```

**Query Parameters:**
- `start_date` (string): Filter by start date
- `end_date` (string): Filter by end date
- `photo_type` (string): Filter by type (front/side/back/other)

**Response (200 OK):**
```json
{
  "photos": [
    {
      "photo_id": 66666,
      "photo_url": "https://cdn.fitnessapp.com/progress/12345/66666.jpg",
      "photo_date": "2024-01-15",
      "photo_type": "front",
      "is_private": false
    }
  ],
  "total": 24
}
```

#### Delete Progress Photo
```http
DELETE /progress-photos/{photo_id}
```

**Response (204 No Content)**

### Workout Programs Endpoints

#### Get Available Programs
```http
GET /programs
```

**Query Parameters:**
- `difficulty` (string): Filter by difficulty
- `duration_weeks` (integer): Filter by duration
- `created_by` (string): Filter by creator (system/ai/user)

**Response (200 OK):**
```json
{
  "programs": [
    {
      "program_id": 1,
      "program_name": "Beginner Strength Foundation",
      "description": "12-week program for building foundational strength",
      "difficulty": "beginner",
      "duration_weeks": 12,
      "created_by": "system",
      "is_public": true,
      "user_count": 1542
    }
  ],
  "total": 25
}
```

#### Get Program Details
```http
GET /programs/{program_id}
```

**Response (200 OK):**
```json
{
  "program_id": 1,
  "program_name": "Beginner Strength Foundation",
  "description": "12-week program for building foundational strength",
  "difficulty": "beginner",
  "duration_weeks": 12,
  "created_by": "system",
  "is_public": true,
  "weeks": [
    {
      "week": 1,
      "workouts": [
        {
          "day": 1,
          "workout_name": "Upper Body A",
          "exercises": [
            {
              "exercise_id": 1,
              "exercise_name": "Barbell Bench Press",
              "sets": 3,
              "reps": "8-10",
              "rest_seconds": 120
            }
          ]
        }
      ]
    }
  ]
}
```

#### Start Program
```http
POST /users/me/programs
```

**Request Body:**
```json
{
  "program_id": 1,
  "started_date": "2024-01-15"
}
```

**Response (201 Created):**
```json
{
  "user_program_id": 77777,
  "user_id": 12345,
  "program_id": 1,
  "started_date": "2024-01-15",
  "is_active": true
}
```

#### Get Active Programs
```http
GET /users/me/programs
```

**Query Parameters:**
- `is_active` (boolean): Filter by active status

**Response (200 OK):**
```json
{
  "programs": [
    {
      "user_program_id": 77777,
      "program": {
        "program_id": 1,
        "program_name": "Beginner Strength Foundation",
        "difficulty": "beginner",
        "duration_weeks": 12
      },
      "started_date": "2024-01-15",
      "is_active": true,
      "progress": {
        "completed_workouts": 8,
        "total_workouts": 36,
        "current_week": 3
      }
    }
  ]
}
```

### Social Features Endpoints

#### Create Social Post
```http
POST /social/posts
```

**Request Body:**
```json
{
  "post_type": "workout",
  "content": "Just crushed a new PR on bench press! 💪",
  "workout_id": 98765
}
```

**Response (201 Created):**
```json
{
  "post_id": 88888,
  "user_id": 12345,
  "post_type": "workout",
  "content": "Just crushed a new PR on bench press! 💪",
  "workout_id": 98765,
  "created_at": "2024-01-15T12:00:00Z",
  "likes_count": 0,
  "comments_count": 0
}
```

#### Get Social Feed
```http
GET /social/feed
```

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response (200 OK):**
```json
{
  "posts": [
    {
      "post_id": 88888,
      "user": {
        "user_id": 12345,
        "username": "johndoe",
        "profile_image_url": "https://cdn.fitnessapp.com/users/12345/profile.jpg"
      },
      "post_type": "workout",
      "content": "Just crushed a new PR on bench press! 💪",
      "workout": {
        "workout_id": 98765,
        "workout_name": "Chest and Triceps - PR Day!",
        "total_volume_kg": 5420.50
      },
      "created_at": "2024-01-15T12:00:00Z",
      "likes_count": 15,
      "comments_count": 3,
      "user_liked": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

#### Like Post
```http
POST /social/posts/{post_id}/likes
```

**Request Body:**
```json
{
  "reaction_type": "fire"
}
```

**Response (201 Created):**
```json
{
  "like_id": 99999,
  "post_id": 88888,
  "user_id": 12345,
  "reaction_type": "fire",
  "created_at": "2024-01-15T12:05:00Z"
}
```

#### Unlike Post
```http
DELETE /social/posts/{post_id}/likes
```

**Response (204 No Content)**

#### Add Comment
```http
POST /social/posts/{post_id}/comments
```

**Request Body:**
```json
{
  "comment_text": "Amazing progress! What's your training split?"
}
```

**Response (201 Created):**
```json
{
  "comment_id": 111111,
  "post_id": 88888,
  "user": {
    "user_id": 67890,
    "username": "janedoe",
    "profile_image_url": "https://cdn.fitnessapp.com/users/67890/profile.jpg"
  },
  "comment_text": "Amazing progress! What's your training split?",
  "created_at": "2024-01-15T12:10:00Z"
}
```

#### Get Post Comments
```http
GET /social/posts/{post_id}/comments
```

**Response (200 OK):**
```json
{
  "comments": [
    {
      "comment_id": 111111,
      "user": {
        "user_id": 67890,
        "username": "janedoe",
        "profile_image_url": "https://cdn.fitnessapp.com/users/67890/profile.jpg"
      },
      "comment_text": "Amazing progress! What's your training split?",
      "created_at": "2024-01-15T12:10:00Z"
    }
  ],
  "total": 3
}
```

#### Follow User
```http
POST /users/{user_id}/follow
```

**Response (201 Created):**
```json
{
  "follow_id": 222222,
  "follower_user_id": 12345,
  "following_user_id": 67890,
  "created_at": "2024-01-15T12:15:00Z"
}
```

#### Unfollow User
```http
DELETE /users/{user_id}/follow
```

**Response (204 No Content)**

#### Get Followers
```http
GET /users/{user_id}/followers
```

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response (200 OK):**
```json
{
  "followers": [
    {
      "user_id": 12345,
      "username": "johndoe",
      "profile_image_url": "https://cdn.fitnessapp.com/users/12345/profile.jpg",
      "tier": "gold",
      "is_following_back": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 89
  }
}
```

#### Get Following
```http
GET /users/{user_id}/following
```

**Response format same as Get Followers**

### Achievements Endpoints

#### Get User Achievements
```http
GET /users/me/achievements
```

**Response (200 OK):**
```json
{
  "achievements": [
    {
      "user_achievement_id": 333333,
      "achievement": {
        "achievement_id": 1,
        "achievement_name": "First Workout",
        "description": "Complete your first workout",
        "points_value": 50,
        "icon_url": "https://cdn.fitnessapp.com/achievements/1.png"
      },
      "earned_date": "2023-01-16T10:00:00Z"
    }
  ],
  "total_points": 5420,
  "tier": "gold",
  "next_tier": {
    "tier": "platinum",
    "required_points": 10000,
    "points_needed": 4580
  }
}
```

#### Get All Achievements
```http
GET /achievements
```

**Response (200 OK):**
```json
{
  "achievements": [
    {
      "achievement_id": 1,
      "achievement_name": "First Workout",
      "description": "Complete your first workout",
      "points_value": 50,
      "icon_url": "https://cdn.fitnessapp.com/achievements/1.png",
      "earned": true,
      "earned_date": "2023-01-16T10:00:00Z"
    },
    {
      "achievement_id": 2,
      "achievement_name": "Consistency King",
      "description": "Work out 30 days in a row",
      "points_value": 500,
      "icon_url": "https://cdn.fitnessapp.com/achievements/2.png",
      "earned": false,
      "progress": {
        "current": 12,
        "required": 30
      }
    }
  ]
}
```

### Cardio Sessions Endpoints

#### Record Cardio Session
```http
POST /cardio-sessions
```

**Request Body:**
```json
{
  "workout_id": 98765,
  "activity_type": "running",
  "duration_minutes": 30,
  "distance_km": 5.2,
  "calories_burned": 320,
  "average_heart_rate": 145,
  "average_speed_kmh": 10.4
}
```

**Response (201 Created):**
```json
{
  "cardio_id": 444444,
  "user_id": 12345,
  "workout_id": 98765,
  "activity_type": "running",
  "duration_minutes": 30,
  "distance_km": 5.2,
  "calories_burned": 320,
  "average_heart_rate": 145,
  "average_speed_kmh": 10.4,
  "created_at": "2024-01-15T07:00:00Z"
}
```

#### Get Cardio History
```http
GET /cardio-sessions
```

**Query Parameters:**
- `activity_type` (string): Filter by activity
- `start_date` (string): Filter by start date
- `end_date` (string): Filter by end date

**Response (200 OK):**
```json
{
  "sessions": [
    {
      "cardio_id": 444444,
      "activity_type": "running",
      "duration_minutes": 30,
      "distance_km": 5.2,
      "calories_burned": 320,
      "average_heart_rate": 145,
      "average_speed_kmh": 10.4,
      "created_at": "2024-01-15T07:00:00Z"
    }
  ],
  "summary": {
    "total_sessions": 15,
    "total_duration_minutes": 450,
    "total_distance_km": 78.5,
    "total_calories": 4800,
    "average_heart_rate": 142
  }
}
```

### Workout Templates Endpoints

#### Create Workout Template
```http
POST /workout-templates
```

**Request Body:**
```json
{
  "template_name": "Push Day A",
  "description": "Chest, shoulders, and triceps workout",
  "is_public": false,
  "exercises": [
    {
      "exercise_id": 1,
      "exercise_order": 1,
      "default_sets": 4,
      "default_reps": 10,
      "default_weight_kg": 80.0
    },
    {
      "exercise_id": 5,
      "exercise_order": 2,
      "default_sets": 3,
      "default_reps": 12,
      "default_weight_kg": 20.0
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "template_id": 555555,
  "user_id": 12345,
  "template_name": "Push Day A",
  "description": "Chest, shoulders, and triceps workout",
  "is_public": false,
  "created_at": "2024-01-15T13:00:00Z",
  "exercises": [
    {
      "template_exercise_id": 666666,
      "exercise": {
        "exercise_id": 1,
        "exercise_name_en": "Barbell Bench Press"
      },
      "exercise_order": 1,
      "default_sets": 4,
      "default_reps": 10,
      "default_weight_kg": 80.0
    }
  ]
}
```

#### Get User Templates
```http
GET /workout-templates
```

**Query Parameters:**
- `is_public` (boolean): Filter by visibility

**Response (200 OK):**
```json
{
  "templates": [
    {
      "template_id": 555555,
      "template_name": "Push Day A",
      "description": "Chest, shoulders, and triceps workout",
      "is_public": false,
      "exercise_count": 6,
      "created_at": "2024-01-15T13:00:00Z"
    }
  ],
  "total": 8
}
```

#### Use Template for Workout
```http
POST /workouts/from-template
```

**Request Body:**
```json
{
  "template_id": 555555,
  "workout_name": "Push Day - Week 4",
  "started_at": "2024-01-15T10:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "workout_id": 777777,
  "workout_name": "Push Day - Week 4",
  "started_at": "2024-01-15T10:00:00Z",
  "exercises": [
    {
      "workout_exercise_id": 888888,
      "exercise_id": 1,
      "exercise_order": 1,
      "sets": [
        {
          "set_id": 999999,
          "set_number": 1,
          "weight_kg": 80.0,
          "reps": 10,
          "is_completed": false
        }
      ]
    }
  ]
}
```

#### Delete Template
```http
DELETE /workout-templates/{template_id}
```

**Response (204 No Content)**

## Notifications

#### Get Notifications
```http
GET /notifications
```

**Query Parameters:**
- `is_read` (boolean): Filter by read status
- `notification_type` (string): Filter by type

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "notification_id": 101010,
      "notification_type": "social",
      "title": "New follower",
      "message": "janedoe started following you",
      "is_read": false,
      "created_at": "2024-01-15T14:00:00Z"
    }
  ],
  "unread_count": 3
}
```

#### Mark Notification as Read
```http
PUT /notifications/{notification_id}/read
```

**Response (200 OK):**
```json
{
  "notification_id": 101010,
  "is_read": true
}
```

#### Mark All Notifications as Read
```http
PUT /notifications/read-all
```

**Response (200 OK):**
```json
{
  "updated_count": 3
}
```

## Exercise Records

#### Get Personal Records
```http
GET /users/me/records
```

**Query Parameters:**
- `exercise_id` (integer): Filter by exercise
- `record_type` (string): Filter by type (1rm/max_volume/max_reps)

**Response (200 OK):**
```json
{
  "records": [
    {
      "record_id": 121212,
      "exercise": {
        "exercise_id": 1,
        "exercise_name_en": "Barbell Bench Press"
      },
      "record_type": "1rm",
      "record_value": 100.0,
      "recorded_date": "2024-01-15",
      "created_at": "2024-01-15T11:30:00Z"
    }
  ]
}
```

#### Update Personal Record
```http
POST /users/me/records
```

**Request Body:**
```json
{
  "exercise_id": 1,
  "record_type": "1rm",
  "record_value": 102.5,
  "recorded_date": "2024-01-15"
}
```

**Response (201 Created):**
```json
{
  "record_id": 131313,
  "user_id": 12345,
  "exercise_id": 1,
  "record_type": "1rm",
  "record_value": 102.5,
  "recorded_date": "2024-01-15",
  "created_at": "2024-01-15T11:45:00Z",
  "previous_record": {
    "record_value": 100.0,
    "recorded_date": "2024-01-08"
  }
}
```

## WebSocket Events

The API supports real-time updates via WebSocket connections for certain features:

### Connection
```
wss://api.fitnessapp.com/v1/ws
```

### Authentication
Send authentication message after connection:
```json
{
  "type": "auth",
  "token": "your-jwt-token"
}
```

### Event Types

#### Workout Updates
```json
{
  "type": "workout_update",
  "data": {
    "workout_id": 98765,
    "user_id": 12345,
    "action": "set_completed",
    "set_id": 44444
  }
}
```

#### Social Notifications
```json
{
  "type": "social_notification",
  "data": {
    "notification_type": "new_follower",
    "user": {
      "user_id": 67890,
      "username": "janedoe"
    }
  }
}
```

#### Rest Timer
```json
{
  "type": "rest_timer",
  "data": {
    "action": "start",
    "duration_seconds": 90,
    "set_id": 44444
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```javascript
import { FitnessAPI } from '@fitnessapp/sdk';

const api = new FitnessAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.fitnessapp.com/v1'
});

// Login
const { user, token } = await api.auth.login({
  email: 'john@example.com',
  password: 'SecurePassword123!'
});

// Create workout
const workout = await api.workouts.create({
  workout_name: 'Leg Day',
  started_at: new Date().toISOString()
});

// Add exercise
const exercise = await api.workouts.addExercise(workout.workout_id, {
  exercise_id: 5,
  exercise_order: 1
});

// Complete set
await api.workouts.completeSet(workout.workout_id, exercise.workout_exercise_id, set.set_id, {
  is_completed: true,
  completed_at: new Date().toISOString()
});
```

### Python
```python
from fitnessapp import FitnessAPI

api = FitnessAPI(api_key='your-api-key')

# Login
auth_response = api.auth.login(
    email='john@example.com',
    password='SecurePassword123!'
)

# Get workout history
workouts = api.workouts.list(
    start_date='2024-01-01',
    end_date='2024-01-31',
    limit=20
)

# Record body metrics
metric = api.body_metrics.create(
    recorded_date='2024-01-15',
    weight_kg=75.5,
    body_fat_percentage=15.2
)
```

### Swift (iOS)
```swift
import FitnessAppSDK

let api = FitnessAPI(apiKey: "your-api-key")

// Login
api.auth.login(email: "john@example.com", password: "SecurePassword123!") { result in
    switch result {
    case .success(let response):
        // Store token
        UserDefaults.standard.set(response.token, forKey: "authToken")
    case .failure(let error):
        print("Login failed: \(error)")
    }
}

// Start workout
let workout = Workout(name: "Morning Routine", startedAt: Date())
api.workouts.create(workout) { result in
    // Handle response
}
```

## Best Practices

1. **Authentication**
   - Store JWT tokens securely
   - Implement token refresh before expiration
   - Never expose tokens in URLs or logs

2. **Error Handling**
   - Always check response status codes
   - Implement exponential backoff for retries
   - Log errors for debugging

3. **Performance**
   - Use pagination for list endpoints
   - Implement caching where appropriate
   - Batch API calls when possible

4. **Data Validation**
   - Validate inputs before sending requests
   - Handle validation errors gracefully
   - Use appropriate data types

5. **Rate Limiting**
   - Monitor rate limit headers
   - Implement queuing for bulk operations
   - Consider upgrading tier for higher limits

## Support

For API support, please contact:
- Email: api-support@fitnessapp.com
- Documentation: https://docs.fitnessapp.com
- Status Page: https://status.fitnessapp.com