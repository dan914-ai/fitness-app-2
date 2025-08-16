import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SchemaIssue {
  table: string;
  column?: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  sql?: string;
}

async function analyzeSchema() {
  console.log('🔍 Analyzing database schema for improvements...\n');
  
  const issues: SchemaIssue[] = [];
  
  // Get all tables and their constraints
  const tables = await prisma.$queryRaw<any[]>`
    SELECT 
      t.table_name,
      t.table_type
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name;
  `;
  
  console.log(`Found ${tables.length} tables to analyze\n`);
  
  // Analyze each table
  for (const table of tables) {
    console.log(`📊 Analyzing table: ${table.table_name}`);
    
    // Get columns
    const columns = await prisma.$queryRaw<any[]>`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ${table.table_name}
      ORDER BY ordinal_position;
    `;
    
    // Get constraints
    const constraints = await prisma.$queryRaw<any[]>`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      LEFT JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
      AND tc.table_name = ${table.table_name};
    `;
    
    // Get indexes
    const indexes = await prisma.$queryRaw<any[]>`
      SELECT 
        i.relname as index_name,
        a.attname as column_name,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relkind = 'r'
      AND t.relname = ${table.table_name}
      ORDER BY i.relname;
    `;
    
    // Analyze issues
    analyzeTableIssues(table.table_name, columns, constraints, indexes, issues);
  }
  
  // Check for missing indexes on foreign keys
  console.log('\n📊 Checking for missing indexes on foreign keys...');
  const missingFkIndexes = await prisma.$queryRaw<any[]>`
    SELECT 
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND NOT EXISTS (
      SELECT 1
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = tc.table_name
      AND a.attname = kcu.column_name
    );
  `;
  
  missingFkIndexes.forEach(fk => {
    issues.push({
      table: fk.table_name,
      column: fk.column_name,
      issue: 'Missing index on foreign key',
      severity: 'medium',
      recommendation: `Add index on ${fk.table_name}.${fk.column_name} for better join performance`,
      sql: `CREATE INDEX idx_${fk.table_name}_${fk.column_name} ON ${fk.table_name}(${fk.column_name});`
    });
  });
  
  // Generate report
  generateReport(issues);
  
  // Generate SQL migration script
  await generateMigrationScript(issues);
  
  return issues;
}

function analyzeTableIssues(
  tableName: string,
  columns: any[],
  constraints: any[],
  indexes: any[],
  issues: SchemaIssue[]
) {
  // Check for missing constraints based on column names
  columns.forEach(col => {
    // Email columns should have CHECK constraints
    if (col.column_name.includes('email') && col.data_type.includes('char')) {
      const hasEmailCheck = constraints.some(c => 
        c.constraint_type === 'CHECK' && 
        c.column_name === col.column_name
      );
      
      if (!hasEmailCheck) {
        issues.push({
          table: tableName,
          column: col.column_name,
          issue: 'Email column without validation constraint',
          severity: 'medium',
          recommendation: 'Add CHECK constraint for email format validation',
          sql: `ALTER TABLE ${tableName} ADD CONSTRAINT chk_${tableName}_${col.column_name}_format CHECK (${col.column_name} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');`
        });
      }
    }
    
    // URL columns should have CHECK constraints
    if (col.column_name.includes('url') && col.data_type.includes('char')) {
      const hasUrlCheck = constraints.some(c => 
        c.constraint_type === 'CHECK' && 
        c.column_name === col.column_name
      );
      
      if (!hasUrlCheck && col.is_nullable === 'NO') {
        issues.push({
          table: tableName,
          column: col.column_name,
          issue: 'URL column without validation constraint',
          severity: 'low',
          recommendation: 'Consider adding CHECK constraint for URL format validation',
          sql: `ALTER TABLE ${tableName} ADD CONSTRAINT chk_${tableName}_${col.column_name}_format CHECK (${col.column_name} ~* '^https?://.*$');`
        });
      }
    }
    
    // Numeric columns that represent percentages
    if (col.column_name.includes('percentage') || col.column_name.includes('rate')) {
      const hasRangeCheck = constraints.some(c => 
        c.constraint_type === 'CHECK' && 
        c.column_name === col.column_name
      );
      
      if (!hasRangeCheck) {
        issues.push({
          table: tableName,
          column: col.column_name,
          issue: 'Percentage column without range constraint',
          severity: 'medium',
          recommendation: 'Add CHECK constraint to ensure value between 0 and 100',
          sql: `ALTER TABLE ${tableName} ADD CONSTRAINT chk_${tableName}_${col.column_name}_range CHECK (${col.column_name} >= 0 AND ${col.column_name} <= 100);`
        });
      }
    }
    
    // Count columns should be non-negative
    if (col.column_name.includes('count') && col.data_type.includes('int')) {
      const hasNonNegativeCheck = constraints.some(c => 
        c.constraint_type === 'CHECK' && 
        c.column_name === col.column_name
      );
      
      if (!hasNonNegativeCheck) {
        issues.push({
          table: tableName,
          column: col.column_name,
          issue: 'Count column without non-negative constraint',
          severity: 'medium',
          recommendation: 'Add CHECK constraint to ensure non-negative values',
          sql: `ALTER TABLE ${tableName} ADD CONSTRAINT chk_${tableName}_${col.column_name}_non_negative CHECK (${col.column_name} >= 0);`
        });
      }
    }
  });
  
  // Check for frequently queried columns without indexes
  const timestampColumns = columns.filter(c => 
    c.column_name.includes('_at') || 
    c.column_name.includes('date')
  );
  
  timestampColumns.forEach(col => {
    const hasIndex = indexes.some(idx => idx.column_name === col.column_name);
    
    if (!hasIndex && ['created_at', 'workout_date', 'start_time'].includes(col.column_name)) {
      issues.push({
        table: tableName,
        column: col.column_name,
        issue: 'Frequently queried timestamp without index',
        severity: 'medium',
        recommendation: 'Add index for better query performance',
        sql: `CREATE INDEX idx_${tableName}_${col.column_name} ON ${tableName}(${col.column_name} DESC);`
      });
    }
  });
  
  // Check for missing composite indexes
  if (tableName === 'workouts') {
    const hasUserDateIndex = indexes.some(idx => 
      idx.index_name === 'idx_workouts_user_id_workout_date'
    );
    
    if (!hasUserDateIndex) {
      issues.push({
        table: tableName,
        issue: 'Missing composite index on user_id and workout_date',
        severity: 'high',
        recommendation: 'Add composite index for user workout queries',
        sql: `CREATE INDEX idx_workouts_user_id_workout_date ON workouts(user_id, workout_date DESC);`
      });
    }
  }
  
  // Check for cascade rules on foreign keys
  const foreignKeys = constraints.filter(c => c.constraint_type === 'FOREIGN KEY');
  
  foreignKeys.forEach(fk => {
    if (fk.delete_rule === 'RESTRICT' && shouldCascade(tableName, fk.column_name)) {
      issues.push({
        table: tableName,
        column: fk.column_name,
        issue: 'Foreign key with RESTRICT instead of CASCADE',
        severity: 'low',
        recommendation: `Consider CASCADE DELETE for ${fk.column_name}`,
        sql: `ALTER TABLE ${tableName} DROP CONSTRAINT ${fk.constraint_name}; ALTER TABLE ${tableName} ADD CONSTRAINT ${fk.constraint_name} FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name}) ON DELETE CASCADE;`
      });
    }
  });
}

function shouldCascade(tableName: string, columnName: string): boolean {
  // Define which relationships should cascade
  const cascadeRules = {
    'workout_exercises': ['workout_id'],
    'exercise_sets': ['workout_exercise_id'],
    'post_likes': ['post_id', 'user_id'],
    'post_comments': ['post_id', 'user_id'],
    'user_achievements': ['user_id'],
    'notifications': ['user_id'],
    'goals': ['user_id'],
    'challenge_participants': ['challenge_id', 'user_id']
  };
  
  return cascadeRules[tableName]?.includes(columnName) || false;
}

function generateReport(issues: SchemaIssue[]) {
  console.log('\n📋 SCHEMA ANALYSIS REPORT\n' + '='.repeat(50));
  
  const highPriority = issues.filter(i => i.severity === 'high');
  const mediumPriority = issues.filter(i => i.severity === 'medium');
  const lowPriority = issues.filter(i => i.severity === 'low');
  
  console.log(`\nTotal issues found: ${issues.length}`);
  console.log(`- High priority: ${highPriority.length}`);
  console.log(`- Medium priority: ${mediumPriority.length}`);
  console.log(`- Low priority: ${lowPriority.length}`);
  
  if (highPriority.length > 0) {
    console.log('\n🔴 HIGH PRIORITY ISSUES:');
    highPriority.forEach(issue => {
      console.log(`\n${issue.table}${issue.column ? '.' + issue.column : ''}`);
      console.log(`  Issue: ${issue.issue}`);
      console.log(`  Recommendation: ${issue.recommendation}`);
    });
  }
  
  if (mediumPriority.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY ISSUES:');
    mediumPriority.forEach(issue => {
      console.log(`\n${issue.table}${issue.column ? '.' + issue.column : ''}`);
      console.log(`  Issue: ${issue.issue}`);
      console.log(`  Recommendation: ${issue.recommendation}`);
    });
  }
  
  if (lowPriority.length > 0) {
    console.log('\n🟢 LOW PRIORITY ISSUES:');
    lowPriority.forEach(issue => {
      console.log(`\n${issue.table}${issue.column ? '.' + issue.column : ''}`);
      console.log(`  Issue: ${issue.issue}`);
      console.log(`  Recommendation: ${issue.recommendation}`);
    });
  }
}

async function generateMigrationScript(issues: SchemaIssue[]) {
  const fs = require('fs').promises;
  const highPriority = issues.filter(i => i.severity === 'high' && i.sql);
  const mediumPriority = issues.filter(i => i.severity === 'medium' && i.sql);
  
  const sqlStatements: string[] = [];
  
  sqlStatements.push('-- Schema Tightening Migration Script');
  sqlStatements.push(`-- Generated on ${new Date().toISOString()}`);
  sqlStatements.push('-- Review each change carefully before executing');
  sqlStatements.push('');
  
  if (highPriority.length > 0) {
    sqlStatements.push('-- HIGH PRIORITY FIXES');
    sqlStatements.push('-- These significantly impact performance or data integrity');
    sqlStatements.push('');
    highPriority.forEach(issue => {
      sqlStatements.push(`-- ${issue.issue} on ${issue.table}${issue.column ? '.' + issue.column : ''}`);
      sqlStatements.push(issue.sql!);
      sqlStatements.push('');
    });
  }
  
  if (mediumPriority.length > 0) {
    sqlStatements.push('-- MEDIUM PRIORITY FIXES');
    sqlStatements.push('-- These improve data validation and query performance');
    sqlStatements.push('');
    mediumPriority.forEach(issue => {
      sqlStatements.push(`-- ${issue.issue} on ${issue.table}${issue.column ? '.' + issue.column : ''}`);
      sqlStatements.push(issue.sql!);
      sqlStatements.push('');
    });
  }
  
  const migrationPath = '/mnt/c/Users/danny/.vscode/new finess app/backend/scripts/schema-tightening.sql';
  await fs.writeFile(migrationPath, sqlStatements.join('\n'));
  console.log(`\n✅ Migration script generated: ${migrationPath}`);
}

// Run analysis
analyzeSchema()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });