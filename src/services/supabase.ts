import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pehrhegxmwbooifenilj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaHJoZWd4bXdib29pZmVuaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1Mjc0NDcsImV4cCI6MjA2OTEwMzQ0N30.-jdwynRk2fGZaA3Q9Xha2iY3bdfEwAm1Sz-Ny6nAg1k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          phone: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          name?: string | null;
          phone: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          phone?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profile']['Row'];
export type ProfileInsert = Database['public']['Tables']['profile']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profile']['Update'];
