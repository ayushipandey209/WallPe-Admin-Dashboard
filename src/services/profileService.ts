import { supabase, type Profile, type ProfileInsert, type ProfileUpdate } from './supabase';

export interface ProfileWithStats extends Profile {
  totalListings?: number;
  activeCampaigns?: number;
  status?: 'active' | 'suspended' | 'pending';
  email?: string;
}

export class ProfileService {
  /**
   * Get all profiles with optional filtering
   */
  static async getAllProfiles(): Promise<ProfileWithStats[]> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      // Transform data to match the expected format for the admin dashboard
      return data.map(profile => ({
        ...profile,
        totalListings: 0, // TODO: Add actual listing count from listings table
        activeCampaigns: 0, // TODO: Add actual campaign count
        status: 'active' as const, // TODO: Add actual status logic
        email: '', // TODO: Get email from auth.users if needed
      }));
    } catch (error) {
      console.error('Error in getAllProfiles:', error);
      throw error;
    }
  }

  /**
   * Get a single profile by ID
   */
  static async getProfileById(id: string): Promise<ProfileWithStats | null> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return {
        ...data,
        totalListings: 0,
        activeCampaigns: 0,
        status: 'active' as const,
        email: '',
      };
    } catch (error) {
      console.error('Error in getProfileById:', error);
      throw error;
    }
  }

  /**
   * Create a new profile
   */
  static async createProfile(profileData: ProfileInsert): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  }

  /**
   * Update an existing profile
   */
  static async updateProfile(id: string, updates: ProfileUpdate): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  /**
   * Delete a profile
   */
  static async deleteProfile(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profile')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteProfile:', error);
      throw error;
    }
  }

  /**
   * Search profiles by name or phone
   */
  static async searchProfiles(query: string): Promise<ProfileWithStats[]> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching profiles:', error);
        throw error;
      }

      return data.map(profile => ({
        ...profile,
        totalListings: 0,
        activeCampaigns: 0,
        status: 'active' as const,
        email: '',
      }));
    } catch (error) {
      console.error('Error in searchProfiles:', error);
      throw error;
    }
  }

  /**
   * Get profiles with pagination
   */
  static async getProfilesPaginated(
    page: number = 1,
    limit: number = 10,
    searchQuery?: string
  ): Promise<{ data: ProfileWithStats[]; total: number; page: number; limit: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('profile')
        .select('*', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching paginated profiles:', error);
        throw error;
      }

      const transformedData = data.map(profile => ({
        ...profile,
        totalListings: 0,
        activeCampaigns: 0,
        status: 'active' as const,
        email: '',
      }));

      return {
        data: transformedData,
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in getProfilesPaginated:', error);
      throw error;
    }
  }
}
