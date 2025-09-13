import { supabase, type Space, type Address, type SpaceMedia, type Profile } from './supabase';

export interface ListingWithDetails extends Space {
  address?: Address | null;
  media?: SpaceMedia[];
  profile?: Profile | null;
  // status is now derived from list_status field in the database
}

export interface ListingFilters {
  type?: string;
  status?: string;
  searchQuery?: string;
}

export class ListingService {
  /**
   * Get all listings with related data (address, media, profile)
   */
  static async getAllListings(): Promise<ListingWithDetails[]> {
    try {
      console.log('Fetching all listings...');
      
      const { data, error } = await supabase
        .from('space')
        .select(`
          *,
          address:address_id(*),
          space_media(*),
          profile:profile_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Fetched listings data:', data);
      console.log('Number of listings:', data?.length || 0);

      // Transform data to include media
      const transformedData = data.map(space => ({
        ...space,
        media: space.space_media || [],
        // list_status is already included from the database query
      }));

      console.log('Transformed listings data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error in getAllListings:', error);
      throw error;
    }
  }

  /**
   * Get a single listing by ID with all related data
   */
  static async getListingById(id: string): Promise<ListingWithDetails | null> {
    try {
      console.log('Fetching listing with ID:', id);
      console.log('ID type:', typeof id);
      
      // First, let's check if there are any spaces in the database
      const { data: allSpaces, error: allSpacesError } = await supabase
        .from('space')
        .select('id, name')
        .limit(5);
      
      console.log('All spaces in database:', allSpaces);
      if (allSpacesError) {
        console.error('Error fetching all spaces:', allSpacesError);
      }
      
      // Try to fetch the space first without relations to see if it exists
      const { data: spaceData, error: spaceError } = await supabase
        .from('space')
        .select('*')
        .eq('id', id)
        .single();

      if (spaceError) {
        console.error('Error fetching space:', spaceError);
        console.error('Error details:', {
          message: spaceError.message,
          details: spaceError.details,
          hint: spaceError.hint,
          code: spaceError.code
        });
        throw spaceError;
      }

      console.log('Found space data:', spaceData);

      // Now fetch related data separately
      const [addressResult, mediaResult, profileResult] = await Promise.all([
        spaceData.address_id ? supabase
          .from('address')
          .select('*')
          .eq('id', spaceData.address_id)
          .single() : Promise.resolve({ data: null, error: null }),
        
        supabase
          .from('space_media')
          .select('*')
          .eq('space_id', id),
        
        supabase
          .from('profile')
          .select('*')
          .eq('id', spaceData.profile_id)
          .single()
      ]);

      console.log('Address data:', addressResult.data);
      console.log('Media data:', mediaResult.data);
      console.log('Profile data:', profileResult.data);

      const result: ListingWithDetails = {
        ...spaceData,
        address: addressResult.data,
        media: mediaResult.data || [],
        profile: profileResult.data,
        // list_status is already included from spaceData
      };

      console.log('Final result:', result);
      return result;
    } catch (error) {
      console.error('Error in getListingById:', error);
      throw error;
    }
  }

  /**
   * Get listings with filtering and search
   */
  static async getListingsFiltered(filters: ListingFilters = {}): Promise<ListingWithDetails[]> {
    try {
      let query = supabase
        .from('space')
        .select(`
          *,
          address:address_id(*),
          space_media(*),
          profile:profile_id(*)
        `);

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      // Apply search query
      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,notes.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching filtered listings:', error);
        throw error;
      }

      return data.map(space => ({
        ...space,
        media: space.space_media || [],
        // list_status is already included from the database query
      }));
    } catch (error) {
      console.error('Error in getListingsFiltered:', error);
      throw error;
    }
  }

  /**
   * Get listings with pagination
   */
  static async getListingsPaginated(
    page: number = 1,
    limit: number = 10,
    filters: ListingFilters = {}
  ): Promise<{ data: ListingWithDetails[]; total: number; page: number; limit: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('space')
        .select(`
          *,
          address:address_id(*),
          space_media(*),
          profile:profile_id(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,notes.ilike.%${filters.searchQuery}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching paginated listings:', error);
        throw error;
      }

      const transformedData = data.map(space => ({
        ...space,
        media: space.space_media || [],
        // list_status is already included from the database query
      }));

      return {
        data: transformedData,
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in getListingsPaginated:', error);
      throw error;
    }
  }

  /**
   * Update listing status (approve/deny)
   */
  static async updateListingStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      console.log(`Updating listing ${id} list_status to ${status}`);
      
      const { error } = await supabase
        .from('space')
        .update({ list_status: status })
        .eq('id', id);

      if (error) {
        console.error('Error updating listing status:', error);
        throw error;
      }
      
      console.log(`Successfully updated listing ${id} status to ${status}`);
    } catch (error) {
      console.error('Error in updateListingStatus:', error);
      throw error;
    }
  }

  /**
   * Delete a listing
   */
  static async deleteListing(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('space')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting listing:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteListing:', error);
      throw error;
    }
  }

  /**
   * Get listing statistics
   */
  static async getListingStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    try {
      const { data: spaces, error: spacesError } = await supabase
        .from('space')
        .select('type, list_status');

      if (spacesError) {
        console.error('Error fetching listing stats:', spacesError);
        throw spacesError;
      }

      const total = spaces.length;
      const byType = spaces.reduce((acc, space) => {
        acc[space.type] = (acc[space.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count by actual list_status from database
      const byStatus = spaces.reduce((acc, space) => {
        const status = space.list_status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { total, byType, byStatus };
    } catch (error) {
      console.error('Error in getListingStats:', error);
      throw error;
    }
  }
}
