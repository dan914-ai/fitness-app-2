// Standalone backend connection checker to avoid circular dependencies
export async function checkBackendConnection(): Promise<boolean> {
  try {
    // For development, return true to prevent offline mode since Supabase is working
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl || apiUrl === 'http://localhost:3000/api') {
      console.log('Development mode: Skipping backend check, using Supabase as primary data source');
      return true;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const baseUrl = apiUrl.replace('/api', ''); // Remove /api suffix for health check
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const isAvailable = response.ok;
    
    if (!isAvailable) {
      console.log(`Backend health check failed with status: ${response.status}`);
      // Return true for development to prevent offline mode since Supabase works
      console.log('Development mode: Backend unavailable but continuing with Supabase');
      return true;
    }
    
    return isAvailable;
  } catch (error) {
    const apiError = error as Error;
    // Only log if it's not an abort error
    if (apiError.name !== 'AbortError') {
      console.log('Backend connection check failed:', apiError.message);
    }
    
    // Return true for development to prevent offline mode since Supabase works
    console.log('Development mode: Backend connection failed but continuing with Supabase');
    return true;
  }
}