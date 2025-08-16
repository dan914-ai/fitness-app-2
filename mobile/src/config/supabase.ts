import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { debugEnvironment } from '../utils/debugEnv';

// Debug environment on load
debugEnvironment();

// Supabase configuration
// NOTE: Replace these with your actual Supabase project URL and anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Debug logging
console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY',
  keyLength: supabaseAnonKey.length,
});

// Validate configuration
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('⚠️ SUPABASE NOT CONFIGURED! Using placeholder values. Auth will not work.');
  console.error('Please check that .env file is loaded and contains EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // For React Native, we need to specify the storage
    storage: undefined, // Will use default AsyncStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Supabase storage bucket name for exercise GIFs
export const EXERCISE_GIFS_BUCKET = 'exercise-gifs';

// Helper function to get public URL for exercise GIF
export const getExerciseGifUrl = (fileName: string): string => {
  const { data } = supabase.storage
    .from(EXERCISE_GIFS_BUCKET)
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};

// Helper function to upload exercise GIF
export const uploadExerciseGif = async (
  fileName: string, 
  file: Blob | File,
  options?: { 
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
) => {
  try {
    const { data, error } = await supabase.storage
      .from(EXERCISE_GIFS_BUCKET)
      .upload(fileName, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType || 'image/gif',
        upsert: options?.upsert || false,
      });

    if (error) {
      console.error('Error uploading GIF:', error);
      return { error };
    }

    return { data, publicUrl: getExerciseGifUrl(fileName) };
  } catch (error) {
    console.error('Exception uploading GIF:', error);
    return { error };
  }
};

// Helper function to delete exercise GIF
export const deleteExerciseGif = async (fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(EXERCISE_GIFS_BUCKET)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting GIF:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Exception deleting GIF:', error);
    return { error };
  }
};

// Helper function to list all exercise GIFs
export const listExerciseGifs = async (folder?: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(EXERCISE_GIFS_BUCKET)
      .list(folder || '', {
        limit: 1000,
        offset: 0,
      });

    if (error) {
      console.error('Error listing GIFs:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Exception listing GIFs:', error);
    return { error };
  }
};

export default supabase;