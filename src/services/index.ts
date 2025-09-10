// Export all services
export { supabase } from './supabase';
export { ProfileService, type ProfileWithStats } from './profileService';

// Re-export types for convenience
export type { Profile, ProfileInsert, ProfileUpdate } from './supabase';
