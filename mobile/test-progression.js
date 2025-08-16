const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the progression service logic
async function testProgressionAlgorithm() {
  console.log('=== TESTING PROGRESSION ALGORITHM ===\n');

  const testUserId = 'test-user-123';
  
  // Test different scenarios
  const scenarios = [
    { name: 'Beginner - No previous weight', currentLoad: 0, exerciseType: 'compound' },
    { name: 'Beginner - No previous weight (isolation)', currentLoad: 0, exerciseType: 'isolation' },
    { name: 'Intermediate - Normal progression', currentLoad: 60, exerciseType: 'compound' },
    { name: 'Advanced - Heavy weight', currentLoad: 100, exerciseType: 'compound' },
  ];

  for (const scenario of scenarios) {
    console.log(`\nTest: ${scenario.name}`);
    console.log(`Current Load: ${scenario.currentLoad}kg`);
    
    // Check for recovery data
    const { data: recoveryData } = await supabase
      .from('user_doms_data')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(1);

    const recovery = recoveryData && recoveryData[0];
    
    // Calculate suggestion (local logic)
    let suggestedLoad = scenario.currentLoad;
    let reason = '';
    
    if (scenario.currentLoad === 0) {
      suggestedLoad = scenario.exerciseType === 'compound' ? 20 : 10;
      reason = '📝 Starting weight suggestion';
    } else if (recovery) {
      const readiness = (recovery.sleep_quality + recovery.energy_level + 
                        (10 - recovery.overall_soreness) + recovery.motivation) / 4;
      
      if (readiness >= 8) {
        suggestedLoad = Math.round(scenario.currentLoad * 1.05);
        reason = '↑ Excellent recovery! +5%';
      } else if (readiness >= 7) {
        suggestedLoad = Math.round(scenario.currentLoad * 1.025);
        reason = '→ Good recovery, small increase';
      } else if (readiness <= 4) {
        suggestedLoad = Math.round(scenario.currentLoad * 0.9);
        reason = '↓ Poor recovery, -10%';
      } else {
        reason = '→ Normal recovery, maintain weight';
      }
    } else {
      // No recovery data - default progression
      suggestedLoad = Math.round(scenario.currentLoad * 1.025);
      reason = '↑ Standard progression (+2.5%)';
    }
    
    console.log(`Suggested Load: ${suggestedLoad}kg`);
    console.log(`Reason: ${reason}`);
  }

  // Test with actual DOMS data
  console.log('\n=== CHECKING ACTUAL DOMS DATA ===');
  const { data: domsData, error: domsError } = await supabase
    .from('user_doms_data')
    .select('*')
    .limit(3);

  if (domsData && domsData.length > 0) {
    console.log(`Found ${domsData.length} DOMS records:`);
    domsData.forEach((record, i) => {
      const readiness = (record.sleep_quality + record.energy_level + 
                        (10 - record.overall_soreness) + record.motivation) / 4;
      console.log(`\nRecord ${i + 1}:`);
      console.log(`  Sleep: ${record.sleep_quality}/10`);
      console.log(`  Energy: ${record.energy_level}/10`);
      console.log(`  Soreness: ${record.overall_soreness}/10`);
      console.log(`  Motivation: ${record.motivation}/10`);
      console.log(`  → Readiness Score: ${readiness.toFixed(1)}/10`);
    });
  }

  // Test with actual session data
  console.log('\n=== CHECKING SESSION RPE DATA ===');
  const { data: sessionData } = await supabase
    .from('user_session_data')
    .select('*')
    .limit(3);

  if (sessionData && sessionData.length > 0) {
    console.log(`Found ${sessionData.length} session records:`);
    sessionData.forEach((record, i) => {
      console.log(`\nSession ${i + 1}:`);
      console.log(`  RPE: ${record.session_rpe}/10`);
      console.log(`  Duration: ${record.duration_minutes} minutes`);
      console.log(`  Total Load: ${record.total_load}kg`);
    });
  }

  console.log('\n=== PROGRESSION ALGORITHM TEST COMPLETE ===');
}

testProgressionAlgorithm().catch(console.error);