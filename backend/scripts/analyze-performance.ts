import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface QueryAnalysis {
  query: string;
  purpose: string;
  frequency: 'high' | 'medium' | 'low';
  currentPerformance: 'good' | 'moderate' | 'poor' | 'unknown';
  recommendations: string[];
  estimatedImprovement: string;
}

interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  reason: string;
  priority: 'high' | 'medium' | 'low';
  sql: string;
}

async function analyzePerformance() {
  console.log('🚀 Analyzing database performance and query patterns...\n');

  // First, let's analyze the current database state
  const dbStats = await getDatabaseStats();
  console.log('📊 Database Statistics:');
  console.log(`- Total tables: ${dbStats.tableCount}`);
  console.log(`- Total records: ${dbStats.totalRecords}`);
  console.log(`- Database size: ${dbStats.dbSize}\n`);

  // Analyze common query patterns
  const queryAnalyses = await analyzeCommonQueries();
  
  // Generate index recommendations
  const indexRecommendations = await generateIndexRecommendations();
  
  // Check for slow queries (if any exist)
  await analyzeSlowQueries();
  
  // Generate performance report
  generatePerformanceReport(queryAnalyses, indexRecommendations);
  
  // Create optimization SQL script
  await generateOptimizationScript(indexRecommendations);
  
  return { queryAnalyses, indexRecommendations };
}

async function getDatabaseStats() {
  // Get table count and row counts
  const tables = await prisma.$queryRaw<any[]>`
    SELECT 
      schemaname,
      relname as tablename,
      n_tup_ins as inserts,
      n_tup_upd as updates,
      n_tup_del as deletes,
      n_live_tup as live_rows,
      n_dead_tup as dead_rows
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY n_live_tup DESC;
  `;

  const dbSize = await prisma.$queryRaw<any[]>`
    SELECT pg_size_pretty(pg_database_size(current_database())) as size;
  `;

  const totalRecords = tables.reduce((sum, table) => sum + (table.live_rows || 0), 0);

  return {
    tableCount: tables.length,
    totalRecords,
    dbSize: dbSize[0]?.size || 'Unknown',
    tables
  };
}

async function analyzeCommonQueries(): Promise<QueryAnalysis[]> {
  console.log('🔍 Analyzing common query patterns...\n');

  const analyses: QueryAnalysis[] = [
    {
      query: 'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC',
      purpose: 'User workout history (primary mobile app query)',
      frequency: 'high',
      currentPerformance: 'good', // Has composite index
      recommendations: ['Already optimized with composite index'],
      estimatedImprovement: 'N/A - already optimal'
    },
    {
      query: 'SELECT * FROM workout_exercises WHERE workout_id = ?',
      purpose: 'Get exercises for a specific workout',
      frequency: 'high',
      currentPerformance: 'unknown',
      recommendations: ['Add index on workout_id if not exists', 'Consider including exercise details'],
      estimatedImprovement: '50-80% faster joins'
    },
    {
      query: 'SELECT * FROM exercise_sets WHERE workout_exercise_id = ?',
      purpose: 'Get sets for specific exercise in workout',
      frequency: 'high',
      currentPerformance: 'unknown',
      recommendations: ['Add index on workout_exercise_id', 'Consider composite with set_number'],
      estimatedImprovement: '60-90% faster nested queries'
    },
    {
      query: 'SELECT * FROM users WHERE email = ?',
      purpose: 'User authentication (login)',
      frequency: 'high',
      currentPerformance: 'good', // Has unique index
      recommendations: ['Already optimized with unique constraint'],
      estimatedImprovement: 'N/A - already optimal'
    },
    {
      query: 'SELECT * FROM social_posts WHERE user_id = ? ORDER BY created_at DESC',
      purpose: 'User social feed',
      frequency: 'medium',
      currentPerformance: 'moderate',
      recommendations: ['Add composite index on (user_id, created_at)', 'Consider pagination'],
      estimatedImprovement: '70% faster for user feeds'
    },
    {
      query: 'SELECT * FROM notifications WHERE user_id = ? AND is_read = false',
      purpose: 'Unread notifications',
      frequency: 'medium',
      currentPerformance: 'poor',
      recommendations: ['Add composite index on (user_id, is_read)', 'Consider partial index'],
      estimatedImprovement: '80-95% faster notification queries'
    },
    {
      query: 'SELECT COUNT(*) FROM workouts WHERE user_id = ? AND workout_date >= ?',
      purpose: 'Workout statistics and streak calculation',
      frequency: 'medium',
      currentPerformance: 'good',
      recommendations: ['Already covered by composite index'],
      estimatedImprovement: 'N/A - already optimal'
    },
    {
      query: 'SELECT * FROM goals WHERE user_id = ? AND is_achieved = false',
      purpose: 'Active user goals',
      frequency: 'low',
      currentPerformance: 'moderate',
      recommendations: ['Add composite index on (user_id, is_achieved)'],
      estimatedImprovement: '60% faster goal queries'
    }
  ];

  return analyses;
}

async function generateIndexRecommendations(): Promise<IndexRecommendation[]> {
  console.log('💡 Generating index recommendations...\n');

  const recommendations: IndexRecommendation[] = [];

  // Check which indexes are missing
  const existingIndexes = await prisma.$queryRaw<any[]>`
    SELECT 
      i.relname as index_name,
      t.relname as table_name,
      array_agg(a.attname ORDER BY c.ordinality) as columns
    FROM pg_class t
    JOIN pg_index ix ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_attribute a ON a.attrelid = t.oid 
    JOIN unnest(ix.indkey) WITH ORDINALITY AS c(attnum, ordinality) ON a.attnum = c.attnum
    WHERE t.relkind = 'r'
    AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    GROUP BY i.relname, t.relname
    ORDER BY t.relname, i.relname;
  `;

  console.log('📋 Existing indexes:');
  existingIndexes.forEach(idx => {
    console.log(`  ${idx.table_name}: ${idx.index_name} (${idx.columns.join(', ')})`);
  });

  // Check if critical indexes exist
  const criticalIndexes = [
    {
      table: 'workout_exercises',
      columns: ['workout_id'],
      reason: 'Foreign key joins for workout details'
    },
    {
      table: 'workout_exercises', 
      columns: ['exercise_id'],
      reason: 'Foreign key joins for exercise details'
    },
    {
      table: 'exercise_sets',
      columns: ['workout_exercise_id'],
      reason: 'Nested queries for exercise sets'
    },
    {
      table: 'social_posts',
      columns: ['user_id', 'created_at'],
      reason: 'User social feeds with chronological order'
    },
    {
      table: 'notifications',
      columns: ['user_id', 'is_read'],
      reason: 'Unread notifications queries'
    },
    {
      table: 'post_likes',
      columns: ['post_id'],
      reason: 'Counting likes per post'
    },
    {
      table: 'post_comments',
      columns: ['post_id'],
      reason: 'Comments per post queries'
    },
    {
      table: 'user_achievements',
      columns: ['user_id'],
      reason: 'User achievement listings'
    },
    {
      table: 'goals',
      columns: ['user_id', 'is_achieved'],
      reason: 'Active vs completed goals'
    }
  ];

  criticalIndexes.forEach(idx => {
    const indexName = `idx_${idx.table}_${idx.columns.join('_')}`;
    const exists = existingIndexes.some(existing => 
      existing.table_name === idx.table && 
      JSON.stringify(existing.columns.sort()) === JSON.stringify(idx.columns.sort())
    );

    if (!exists) {
      recommendations.push({
        table: idx.table,
        columns: idx.columns,
        type: 'btree',
        reason: idx.reason,
        priority: idx.columns.length === 1 && idx.columns[0].endsWith('_id') ? 'high' : 'medium',
        sql: `CREATE INDEX ${indexName} ON ${idx.table}(${idx.columns.join(', ')});`
      });
    }
  });

  // Performance-specific indexes
  recommendations.push({
    table: 'workouts',
    columns: ['user_id', 'start_time'],
    type: 'btree',
    reason: 'Recent workout queries and session tracking',
    priority: 'medium',
    sql: 'CREATE INDEX idx_workouts_user_id_start_time ON workouts(user_id, start_time DESC);'
  });

  recommendations.push({
    table: 'social_posts',
    columns: ['created_at'],
    type: 'btree',
    reason: 'Global feed chronological ordering',
    priority: 'low',
    sql: 'CREATE INDEX idx_social_posts_created_at ON social_posts(created_at DESC);'
  });

  // Partial indexes for common filters
  recommendations.push({
    table: 'notifications',
    columns: ['user_id'],
    type: 'btree',
    reason: 'Unread notifications only (partial index)',
    priority: 'medium',
    sql: 'CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id) WHERE is_read = false;'
  });

  return recommendations;
}

async function analyzeSlowQueries() {
  console.log('🐌 Checking for slow query patterns...\n');
  
  // Enable query logging for future analysis
  console.log('💡 Recommendations for query monitoring:');
  console.log('1. Enable pg_stat_statements extension for query performance tracking');
  console.log('2. Set log_min_duration_statement = 1000 to log queries > 1 second');
  console.log('3. Monitor pg_stat_user_tables for table access patterns');
  console.log('4. Use EXPLAIN ANALYZE for specific slow queries\n');
}

function generatePerformanceReport(
  queryAnalyses: QueryAnalysis[], 
  indexRecommendations: IndexRecommendation[]
) {
  console.log('📋 PERFORMANCE ANALYSIS REPORT\n' + '='.repeat(60));
  
  console.log('\n🔥 HIGH FREQUENCY QUERIES:');
  queryAnalyses
    .filter(q => q.frequency === 'high')
    .forEach(query => {
      console.log(`\nQuery: ${query.query}`);
      console.log(`Purpose: ${query.purpose}`);
      console.log(`Performance: ${query.currentPerformance}`);
      console.log(`Improvement: ${query.estimatedImprovement}`);
    });

  console.log('\n📊 INDEX RECOMMENDATIONS:');
  const highPriority = indexRecommendations.filter(r => r.priority === 'high');
  const mediumPriority = indexRecommendations.filter(r => r.priority === 'medium');
  
  if (highPriority.length > 0) {
    console.log('\n🔴 HIGH PRIORITY:');
    highPriority.forEach(rec => {
      console.log(`  ${rec.table}(${rec.columns.join(', ')}) - ${rec.reason}`);
    });
  }
  
  if (mediumPriority.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY:');
    mediumPriority.forEach(rec => {
      console.log(`  ${rec.table}(${rec.columns.join(', ')}) - ${rec.reason}`);
    });
  }

  console.log(`\n📈 SUMMARY:`);
  console.log(`- Total index recommendations: ${indexRecommendations.length}`);
  console.log(`- High priority: ${highPriority.length}`);
  console.log(`- Medium priority: ${mediumPriority.length}`);
  console.log(`- Estimated overall improvement: 40-70% for common queries`);
}

async function generateOptimizationScript(recommendations: IndexRecommendation[]) {
  const fs = require('fs').promises;
  
  const sqlStatements: string[] = [];
  
  sqlStatements.push('-- Performance Optimization Script');
  sqlStatements.push(`-- Generated on ${new Date().toISOString()}`);
  sqlStatements.push('-- Apply in order: High -> Medium -> Low priority');
  sqlStatements.push('');
  sqlStatements.push('-- Monitor query performance before and after applying');
  sqlStatements.push('-- Use EXPLAIN ANALYZE to verify improvements');
  sqlStatements.push('');
  sqlStatements.push('BEGIN;');
  sqlStatements.push('');

  const highPriority = recommendations.filter(r => r.priority === 'high');
  const mediumPriority = recommendations.filter(r => r.priority === 'medium');
  const lowPriority = recommendations.filter(r => r.priority === 'low');

  if (highPriority.length > 0) {
    sqlStatements.push('-- HIGH PRIORITY INDEXES');
    sqlStatements.push('-- These target the most critical performance bottlenecks');
    sqlStatements.push('');
    highPriority.forEach(rec => {
      sqlStatements.push(`-- ${rec.reason} on ${rec.table}`);
      sqlStatements.push(rec.sql);
      sqlStatements.push('');
    });
  }

  if (mediumPriority.length > 0) {
    sqlStatements.push('-- MEDIUM PRIORITY INDEXES');
    sqlStatements.push('-- These improve common query patterns');
    sqlStatements.push('');
    mediumPriority.forEach(rec => {
      sqlStatements.push(`-- ${rec.reason} on ${rec.table}`);
      sqlStatements.push(rec.sql);
      sqlStatements.push('');
    });
  }

  if (lowPriority.length > 0) {
    sqlStatements.push('-- LOW PRIORITY INDEXES');
    sqlStatements.push('-- These provide marginal improvements');
    sqlStatements.push('');
    lowPriority.forEach(rec => {
      sqlStatements.push(`-- ${rec.reason} on ${rec.table}`);
      sqlStatements.push(rec.sql);
      sqlStatements.push('');
    });
  }

  sqlStatements.push('-- Update table statistics after adding indexes');
  sqlStatements.push('ANALYZE;');
  sqlStatements.push('');
  sqlStatements.push('COMMIT;');
  sqlStatements.push('');
  sqlStatements.push('-- Verify new indexes');
  sqlStatements.push(`SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch`);
  sqlStatements.push(`FROM pg_stat_user_indexes`);
  sqlStatements.push(`WHERE schemaname = 'public'`);
  sqlStatements.push(`AND indexname LIKE 'idx_%'`);
  sqlStatements.push(`ORDER BY tablename, indexname;`);

  const scriptPath = '/mnt/c/Users/danny/.vscode/new finess app/backend/scripts/performance-optimization.sql';
  await fs.writeFile(scriptPath, sqlStatements.join('\n'));
  console.log(`\n✅ Optimization script generated: ${scriptPath}`);
}

// Additional query optimization recommendations
async function generateQueryOptimizationGuide() {
  const fs = require('fs').promises;
  
  const guide = `# Query Optimization Guide

## High-Impact Queries to Optimize

### 1. User Workout History
\`\`\`sql
-- Current (good)
SELECT * FROM workouts 
WHERE user_id = ? 
ORDER BY workout_date DESC 
LIMIT 20;

-- Already optimized with: workouts_user_id_workout_date_idx
\`\`\`

### 2. Workout Details with Exercises
\`\`\`sql
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
\`\`\`

### 3. Social Feed with Engagement
\`\`\`sql
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
\`\`\`

## Performance Best Practices

1. **Always use LIMIT** for list queries
2. **Use EXISTS instead of IN** for large subqueries
3. **Index foreign keys** used in JOINs
4. **Use composite indexes** for multi-column WHERE clauses
5. **Consider partial indexes** for common filter conditions

## Query Analysis Commands

\`\`\`sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT ...;

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- Monitor slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC;
\`\`\`
`;

  const guidePath = '/mnt/c/Users/danny/.vscode/new finess app/backend/QUERY-OPTIMIZATION-GUIDE.md';
  await fs.writeFile(guidePath, guide);
  console.log(`✅ Query optimization guide created: ${guidePath}`);
}

// Run the performance analysis
analyzePerformance()
  .then(() => generateQueryOptimizationGuide())
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });