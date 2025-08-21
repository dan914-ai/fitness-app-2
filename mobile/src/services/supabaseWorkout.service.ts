import { supabase } from '../config/supabase';

interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

class SupabaseWorkoutService {
  /**
   * Get paginated workouts for the current user
   */
  async getWorkouts(params?: PaginationParams): Promise<PaginatedResponse<any>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const orderBy = params?.orderBy || 'created_at';
    const order = params?.order || 'desc';
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    try {
      // Get total count first
      const { count, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (countError) throw countError;
      
      // Get paginated data
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            workout_sets (*)
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order(orderBy, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      };
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  }

  /**
   * Get paginated workout history
   */
  async getWorkoutHistory(params?: PaginationParams & { 
    startDate?: string; 
    endDate?: string;
  }): Promise<PaginatedResponse<any>> {
    const page = params?.page || 1;
    const limit = params?.limit || 30;
    const offset = (page - 1) * limit;
    
    try {
      let query = supabase
        .from('workout_history')
        .select('*', { count: 'exact' })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      // Add date filters if provided
      if (params?.startDate) {
        query = query.gte('created_at', params.startDate);
      }
      if (params?.endDate) {
        query = query.lte('created_at', params.endDate);
      }
      
      // Get total count
      const { count } = await query;
      
      // Get paginated data
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      };
    } catch (error) {
      console.error('Error fetching workout history:', error);
      throw error;
    }
  }

  /**
   * Get paginated exercises
   */
  async getExercises(params?: PaginationParams & {
    muscleGroup?: string;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<any>> {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const offset = (page - 1) * limit;
    
    try {
      let query = supabase
        .from('exercises')
        .select('*', { count: 'exact' });
      
      // Add filters
      if (params?.muscleGroup) {
        query = query.eq('target_muscle_group', params.muscleGroup);
      }
      if (params?.category) {
        query = query.eq('category', params.category);
      }
      if (params?.search) {
        query = query.or(`name_ko.ilike.%${params.search}%,name_en.ilike.%${params.search}%`);
      }
      
      // Get total count
      const { count } = await query;
      
      // Get paginated data
      const { data, error } = await query
        .order('name_ko')
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      };
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  }

  /**
   * Get paginated personal records
   */
  async getPersonalRecords(params?: PaginationParams & {
    exerciseId?: string;
  }): Promise<PaginatedResponse<any>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;
    
    try {
      let query = supabase
        .from('personal_records')
        .select(`
          *,
          exercises (name_ko, name_en)
        `, { count: 'exact' })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (params?.exerciseId) {
        query = query.eq('exercise_id', params.exerciseId);
      }
      
      // Get total count
      const { count } = await query;
      
      // Get paginated data
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      };
    } catch (error) {
      console.error('Error fetching personal records:', error);
      throw error;
    }
  }

  /**
   * Get paginated InBody history
   */
  async getInBodyHistory(params?: PaginationParams): Promise<PaginatedResponse<any>> {
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const offset = (page - 1) * limit;
    
    try {
      const { count } = await supabase
        .from('inbody_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      const { data, error } = await supabase
        .from('inbody_history')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      };
    } catch (error) {
      console.error('Error fetching InBody history:', error);
      throw error;
    }
  }

  /**
   * Cursor-based pagination for real-time feeds
   */
  async getWorkoutFeed(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<{
    data: any[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const limit = params?.limit || 20;
    
    try {
      let query = supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit + 1); // Fetch one extra to check if there's more
      
      if (params?.cursor) {
        query = query.lt('created_at', params.cursor);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const hasMore = (data?.length || 0) > limit;
      const results = hasMore ? data!.slice(0, -1) : (data || []);
      const nextCursor = hasMore ? results[results.length - 1]?.created_at : undefined;
      
      return {
        data: results,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching workout feed:', error);
      throw error;
    }
  }
}

export default new SupabaseWorkoutService();