export function debugEnvironment() {
  console.log('=== ENVIRONMENT DEBUG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('EXPO_')));
  
  // Check specific vars
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('EXPO_PUBLIC_SUPABASE_URL type:', typeof supabaseUrl);
  console.log('EXPO_PUBLIC_SUPABASE_URL defined:', supabaseUrl !== undefined);
  console.log('EXPO_PUBLIC_SUPABASE_URL length:', supabaseUrl?.length);
  
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'NOT SET');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY length:', supabaseKey?.length);
  
  // Check if it's the placeholder
  if (supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.error('❌ SUPABASE URL IS STILL THE PLACEHOLDER!');
  }
  
  console.log('=== END DEBUG ===');
}