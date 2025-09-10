import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection by fetching profiles
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection failed:', error);
      return { success: false, error: error.message };
    }

    console.log('Supabase connection successful!');
    console.log('Sample data:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Connection test failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
