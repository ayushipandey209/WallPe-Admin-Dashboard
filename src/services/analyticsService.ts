import { supabase } from './supabase';

export interface TimelineDataPoint {
  month: string;
  listings: number;
}

export interface ListingTypeDataPoint {
  type: string;
  count: number;
  fill: string;
}

export interface UserActivityDataPoint {
  month: string;
  newUsers: number;
  activeUsers: number;
}

export interface RecentActivityItem {
  id: string;
  userName: string;
  userEmail: string;
  type: string;
  location: string;
  status: string;
  price: number;
  dateAdded: string;
  timeAgo: string;
}

export class AnalyticsService {
  /**
   * Calculate time ago from a date string
   */
  private static getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  }
  /**
   * Get monthly listing submissions timeline data
   * Fetches real data from the database grouped by month
   */
  static async getListingsTimelineData(year?: number): Promise<TimelineDataPoint[]> {
    try {
      console.log('Fetching listings timeline data...');
      
      // Get current year if not specified
      const targetYear = year || new Date().getFullYear();
      
      // Query to get listings grouped by month
      const { data, error } = await supabase
        .from('space')
        .select('created_at')
        .gte('created_at', `${targetYear}-01-01`)
        .lt('created_at', `${targetYear + 1}-01-01`);

      if (error) {
        console.error('Error fetching timeline data:', error);
        throw error;
      }

      // Group data by month
      const monthlyCounts: Record<string, number> = {};
      
      // Initialize all months with 0
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthNames.forEach(month => {
        monthlyCounts[month] = 0;
      });

      // Count listings per month
      data?.forEach(listing => {
        const date = new Date(listing.created_at);
        const monthIndex = date.getMonth();
        const monthName = monthNames[monthIndex];
        monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1;
      });

      // Convert to array format expected by charts
      const timelineData: TimelineDataPoint[] = monthNames.map(month => ({
        month,
        listings: monthlyCounts[month]
      }));

      console.log('Generated timeline data:', timelineData);
      return timelineData;
    } catch (error) {
      console.error('Error in getListingsTimelineData:', error);
      // Return fallback data if there's an error
      return [
        { month: 'Jan', listings: 0 },
        { month: 'Feb', listings: 0 },
        { month: 'Mar', listings: 0 },
        { month: 'Apr', listings: 0 },
        { month: 'May', listings: 0 },
        { month: 'Jun', listings: 0 },
        { month: 'Jul', listings: 0 },
        { month: 'Aug', listings: 0 },
        { month: 'Sep', listings: 0 },
        { month: 'Oct', listings: 0 },
        { month: 'Nov', listings: 0 },
        { month: 'Dec', listings: 0 }
      ];
    }
  }

  /**
   * Get listing type distribution data
   */
  static async getListingTypeData(): Promise<ListingTypeDataPoint[]> {
    try {
      console.log('Fetching listing type data...');
      
      const { data, error } = await supabase
        .from('space')
        .select('type');

      if (error) {
        console.error('Error fetching listing type data:', error);
        throw error;
      }

      // Count listings by type
      const typeCounts: Record<string, number> = {};
      data?.forEach(listing => {
        const type = listing.type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      // Define colors for different types
      const colors = [
        'var(--chart-1)',
        'var(--chart-2)', 
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)'
      ];

      // Convert to array format with colors
      const typeData: ListingTypeDataPoint[] = Object.entries(typeCounts).map(([type, count], index) => ({
        type,
        count,
        fill: colors[index % colors.length]
      }));

      console.log('Generated listing type data:', typeData);
      return typeData;
    } catch (error) {
      console.error('Error in getListingTypeData:', error);
      // Return fallback data
      return [
        { type: 'Wall', count: 0, fill: 'var(--chart-1)' },
        { type: 'Land', count: 0, fill: 'var(--chart-2)' }
      ];
    }
  }

  /**
   * Get user activity data (new users and active users)
   * Note: This would require user activity tracking which might not be available yet
   */
  static async getUserActivityData(): Promise<UserActivityDataPoint[]> {
    try {
      console.log('Fetching user activity data...');
      
      // For now, return mock data since user activity tracking might not be implemented
      // This can be updated when user activity tracking is available
      return [
        { month: 'Jan', newUsers: 0, activeUsers: 0 },
        { month: 'Feb', newUsers: 0, activeUsers: 0 },
        { month: 'Mar', newUsers: 0, activeUsers: 0 },
        { month: 'Apr', newUsers: 0, activeUsers: 0 },
        { month: 'May', newUsers: 0, activeUsers: 0 },
        { month: 'Jun', newUsers: 0, activeUsers: 0 }
      ];
    } catch (error) {
      console.error('Error in getUserActivityData:', error);
      return [];
    }
  }

  /**
   * Get analytics data for a specific date range
   */
  static async getAnalyticsDataRange(
    startDate: string, 
    endDate: string
  ): Promise<{
    timelineData: TimelineDataPoint[];
    typeData: ListingTypeDataPoint[];
    totalListings: number;
  }> {
    try {
      console.log(`Fetching analytics data from ${startDate} to ${endDate}`);
      
      const { data, error } = await supabase
        .from('space')
        .select('created_at, type')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {
        console.error('Error fetching analytics data range:', error);
        throw error;
      }

      // Process timeline data for the date range
      const timelineData: TimelineDataPoint[] = [];
      const typeCounts: Record<string, number> = {};
      
      data?.forEach(listing => {
        const date = new Date(listing.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Find or create timeline entry
        let timelineEntry = timelineData.find(entry => entry.month === monthKey);
        if (!timelineEntry) {
          timelineEntry = { month: monthKey, listings: 0 };
          timelineData.push(timelineEntry);
        }
        timelineEntry.listings++;

        // Count by type
        const type = listing.type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      // Convert type data to array format
      const colors = [
        'var(--chart-1)',
        'var(--chart-2)', 
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)'
      ];

      const typeData: ListingTypeDataPoint[] = Object.entries(typeCounts).map(([type, count], index) => ({
        type,
        count,
        fill: colors[index % colors.length]
      }));

      return {
        timelineData: timelineData.sort((a, b) => a.month.localeCompare(b.month)),
        typeData,
        totalListings: data?.length || 0
      };
    } catch (error) {
      console.error('Error in getAnalyticsDataRange:', error);
      throw error;
    }
  }

  /**
   * Get recent activity data (latest listings and approvals)
   * Fetches the most recent listings with user information
   */
  static async getRecentActivity(limit: number = 10): Promise<RecentActivityItem[]> {
    try {
      console.log('Fetching recent activity data...');
      
      const { data, error } = await supabase
        .from('space')
        .select(`
          id,
          name,
          type,
          created_at,
          list_status,
          notes,
          address:address_id(*),
          profile:profile_id(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent activity:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Raw recent activity data from database:', data);
      console.log('Number of spaces found:', data?.length || 0);

      // Transform data to match the expected format
      const recentActivity: RecentActivityItem[] = data?.map(space => {
        
        const userName = space.profile?.name || 'Unknown User';
        const userEmail = space.profile?.phone || ''; // Using phone as identifier since email might not be available
        const location = space.address ? 
          `${space.address.address_line1 || ''} ${space.address.city || ''} ${space.address.district || ''} ${space.address.state || ''}`.trim() || 
          `${space.address.village || ''} ${space.address.panchayat || ''}`.trim() || 
          'Location not specified' : 'Location not specified';
        const dateAdded = space.created_at || new Date().toISOString();
        
        const activityItem = {
          id: space.id,
          userName,
          userEmail,
          type: space.type || 'unknown',
          location,
          status: space.list_status || 'pending',
          price: 25000, // Default price since it's not in the database schema
          dateAdded,
          timeAgo: this.getTimeAgo(dateAdded)
        };
        
        return activityItem;
      }) || [];

      console.log('Generated recent activity data:', recentActivity);
      return recentActivity;
    } catch (error) {
      console.error('Error in getRecentActivity:', error);
      // Return fallback data if there's an error
      return [
        {
          id: 'fallback-1',
          userName: 'Sample User',
          userEmail: '+91 98765 43210',
          type: 'wall',
          location: 'Sample Location',
          status: 'pending',
          price: 25000,
          dateAdded: new Date().toISOString(),
          timeAgo: 'just now'
        }
      ];
    }
  }
}
