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
      space: {
        Row: {
          id: string;
          name: string;
          phone_number: string | null;
          profile_id: string;
          length_ft: number | null;
          width_ft: number | null;
          created_at: string | null;
          address_id: number | null;
          type: string;
          notes: string | null;
          location: any | null; // geometry type
          length_in: number | null;
          width_in: number | null;
          list_status: 'pending' | 'approved' | 'rejected' | null;
        };
        Insert: {
          id?: string;
          name: string;
          phone_number?: string | null;
          profile_id: string;
          length_ft?: number | null;
          width_ft?: number | null;
          created_at?: string | null;
          address_id?: number | null;
          type?: string;
          notes?: string | null;
          location?: any | null;
          length_in?: number | null;
          width_in?: number | null;
          list_status?: 'pending' | 'approved' | 'rejected' | null;
        };
        Update: {
          id?: string;
          name?: string;
          phone_number?: string | null;
          profile_id?: string;
          length_ft?: number | null;
          width_ft?: number | null;
          created_at?: string | null;
          address_id?: number | null;
          type?: string;
          notes?: string | null;
          location?: any | null;
          length_in?: number | null;
          width_in?: number | null;
          list_status?: 'pending' | 'approved' | 'rejected' | null;
        };
      };
      address: {
        Row: {
          id: number;
          created_at: string;
          address_line1: string | null;
          address_line2: string | null;
          village: string | null;
          panchayat: string | null;
          taluk: string | null;
          block: string | null;
          district: string | null;
          state: string | null;
          country_code: string | null;
          location: any | null; // geometry type
          landmark: string | null;
          thana: string | null;
          pincode: number | null;
          city: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          address_line1?: string | null;
          address_line2?: string | null;
          village?: string | null;
          panchayat?: string | null;
          taluk?: string | null;
          block?: string | null;
          district?: string | null;
          state?: string | null;
          country_code?: string | null;
          location?: any | null;
          landmark?: string | null;
          thana?: string | null;
          pincode?: number | null;
          city?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          address_line1?: string | null;
          address_line2?: string | null;
          village?: string | null;
          panchayat?: string | null;
          taluk?: string | null;
          block?: string | null;
          district?: string | null;
          state?: string | null;
          country_code?: string | null;
          location?: any | null;
          landmark?: string | null;
          thana?: string | null;
          pincode?: number | null;
          city?: string | null;
        };
      };
      space_media: {
        Row: {
          id: string;
          created_at: string;
          space_id: string;
          type: string;
          url: string;
          metadata: any | null; // jsonb type
        };
        Insert: {
          id?: string;
          created_at?: string;
          space_id: string;
          type?: string;
          url: string;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          space_id?: string;
          type?: string;
          url?: string;
          metadata?: any | null;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profile']['Row'];
export type ProfileInsert = Database['public']['Tables']['profile']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profile']['Update'];

export type Space = Database['public']['Tables']['space']['Row'];
export type SpaceInsert = Database['public']['Tables']['space']['Insert'];
export type SpaceUpdate = Database['public']['Tables']['space']['Update'];

export type Address = Database['public']['Tables']['address']['Row'];
export type AddressInsert = Database['public']['Tables']['address']['Insert'];
export type AddressUpdate = Database['public']['Tables']['address']['Update'];

export type SpaceMedia = Database['public']['Tables']['space_media']['Row'];
export type SpaceMediaInsert = Database['public']['Tables']['space_media']['Insert'];
export type SpaceMediaUpdate = Database['public']['Tables']['space_media']['Update'];
