import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPerformance() {
  console.log('🧪 Testing database performance with current indexes...\n');

  // Test 1: Simple workout query (should be fast with existing index)
  console.log('📊 Test 1: User workout history query');
  const start1 = Date.now();
  
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: BigInt(1) },
      orderBy: { workoutDate: 'desc' },
      take: 10
    });
    
    const time1 = Date.now() - start1;
    console.log(`✅ Retrieved ${workouts.length} workouts in ${time1}ms`);
  } catch (error) {
    console.log('❌ Query failed (likely no data)');
  }

  // Test 2: Workout with exercises (should benefit from new indexes)
  console.log('\n📊 Test 2: Workout details with exercises');
  const start2 = Date.now();
  
  try {
    const workoutWithExercises = await prisma.workout.findFirst({
      where: { userId: BigInt(1) },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
            exerciseSets: true
          }
        }
      }
    });
    
    const time2 = Date.now() - start2;
    console.log(`✅ Retrieved workout with nested data in ${time2}ms`);
  } catch (error) {
    console.log('❌ Query failed (likely no data)');
  }

  // Test 3: Check index usage statistics
  console.log('\n📊 Test 3: Index usage statistics');
  
  try {
    const indexStats = await prisma.$queryRaw<any[]>`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched,
        CASE 
          WHEN idx_scan = 0 THEN 'Unused'
          WHEN idx_scan < 10 THEN 'Low usage'
          WHEN idx_scan < 100 THEN 'Medium usage'
          ELSE 'High usage'
        END as usage_level
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND (indexname LIKE 'idx_%' OR indexname LIKE '%_idx')
      ORDER BY idx_scan DESC;
    `;

    console.log('Index Usage Statistics:');
    indexStats.forEach(stat => {
      console.log(`  ${stat.tablename}.${stat.indexname}: ${stat.scans || 0} scans (${stat.usage_level})`);
    });

  } catch (error) {
    console.log('❌ Could not retrieve index statistics');
  }

  // Test 4: Query plan analysis for critical queries
  console.log('\n📊 Test 4: Query plan analysis');
  
  try {
    const queryPlan = await prisma.$queryRaw<any[]>`
      EXPLAIN (FORMAT JSON, ANALYZE false)
      SELECT w.*, we.exercise_id, e.exercise_name
      FROM workouts w
      LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
      LEFT JOIN exercises e ON we.exercise_id = e.exercise_id
      WHERE w.user_id = 1
      ORDER BY w.workout_date DESC
      LIMIT 10;
    `;

    console.log('✅ Query plan generated (check for index scans vs seq scans)');
    const plan = queryPlan[0]['QUERY PLAN'];
    const hasIndexScan = JSON.stringify(plan).includes('Index Scan') || JSON.stringify(plan).includes('Bitmap Index Scan');
    console.log(`   Uses indexes: ${hasIndexScan ? '✅ Yes' : '❌ No (sequential scans)'}`);
    
  } catch (error) {
    console.log('❌ Could not analyze query plan');
  }

  // Test 5: Database performance summary
  console.log('\n📊 Test 5: Performance summary');
  
  try {
    const dbStats = await prisma.$queryRaw<any[]>`
      SELECT 
        (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE idx_scan > 0) as active_indexes,
        (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE idx_scan = 0) as unused_indexes,
        (SELECT COUNT(*) FROM pg_stat_user_tables WHERE n_tup_ins + n_tup_upd + n_tup_del > 0) as active_tables,
        pg_size_pretty(pg_database_size(current_database())) as db_size;
    `;

    const stats = dbStats[0];
    console.log(`Database Performance Summary:`);
    console.log(`  - Database size: ${stats.db_size}`);
    console.log(`  - Active indexes: ${stats.active_indexes}`);  
    console.log(`  - Unused indexes: ${stats.unused_indexes}`);
    console.log(`  - Active tables: ${stats.active_tables}`);

  } catch (error) {
    console.log('❌ Could not retrieve database statistics');
  }

  console.log('\n✨ Performance testing complete!');
  console.log('\n💡 Recommendations:');
  console.log('1. Monitor index usage in production');
  console.log('2. Add more indexes as data grows');
  console.log('3. Use EXPLAIN ANALYZE for slow queries');
  console.log('4. Consider query optimization for complex joins');
  
  return true;
}

// Run performance tests
testPerformance()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });