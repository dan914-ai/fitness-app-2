export function debugEnvironment() {
  
  // Check specific vars
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  
  
  // Check if it's the placeholder
  if (supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.error('❌ SUPABASE URL IS STILL THE PLACEHOLDER!');
  }
  
}