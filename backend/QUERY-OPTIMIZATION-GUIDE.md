# Query Optimization Guide

## High-Impact Queries to Optimize

### 1. User Workout History
```sql
-- Current (good)
SELECT * FROM workouts 
WHERE user_id = ? 
ORDER BY workout_date DESC 
LIMIT 20;

-- Already optimized with: workouts_user_id_workout_date_idx
```

### 2. Workout Details with Exercises
```sql
-- Optimized query structure
SELECT 
  w.*,
  json_agg(
    json_build_object(
      'exercise_id', we.exercise_id,
      'exercise_name', e.exercise_name,
      'sets', we.actual_sets,
      'order', we.order_in_workout
    ) ORDER BY we.order_in_workout
  ) as exercises
FROM workouts w
LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
LEFT JOIN exercises e ON we.exercise_id = e.exercise_id
WHERE w.user_id = ?
GROUP BY w.workout_id
ORDER BY w.workout_date DESC;
```

### 3. Social Feed with Engagement
```sql
-- Optimized social feed query
SELECT 
  sp.*,
  u.username,
  u.profile_image_url,
  (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = sp.post_id) as actual_likes,
  (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = sp.post_id) as actual_comments
FROM social_posts sp
JOIN users u ON sp.user_id = u.user_id
ORDER BY sp.created_at DESC
LIMIT 20;
```

## Performance Best Practices

1. **Always use LIMIT** for list queries
2. **Use EXISTS instead of IN** for large subqueries
3. **Index foreign keys** used in JOINs
4. **Use composite indexes** for multi-column WHERE clauses
5. **Consider partial indexes** for common filter conditions

## Query Analysis Commands

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT ...;

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- Monitor slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC;
```
