// Export all services
export { supabase } from './supabase';
export { ProfileService, type ProfileWithStats } from './profileService';
export { ListingService, type ListingWithDetails } from './listingService';

// Re-export types for convenience
export type { 
  Profile, ProfileInsert, ProfileUpdate,
  Space, SpaceInsert, SpaceUpdate,
  Address, AddressInsert, AddressUpdate,
  SpaceMedia, SpaceMediaInsert, SpaceMediaUpdate
} from './supabase';
