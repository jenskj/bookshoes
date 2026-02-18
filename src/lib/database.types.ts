/**
 * Supabase database types (derived from schema migrations).
 * Regenerate with: npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string;
          name: string;
          is_private: boolean;
          tagline: string | null;
          description: string | null;
          created_at: string;
          modified_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_private?: boolean;
          tagline?: string | null;
          description?: string | null;
          created_at?: string;
          modified_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_private?: boolean;
          tagline?: string | null;
          description?: string | null;
          created_at?: string;
          modified_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          photo_url: string | null;
          active_club_id: string | null;
          memberships: string[];
          created_at: string;
          modified_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          photo_url?: string | null;
          active_club_id?: string | null;
          memberships?: string[];
          created_at?: string;
          modified_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          photo_url?: string | null;
          active_club_id?: string | null;
          memberships?: string[];
          created_at?: string;
          modified_at?: string;
        };
        Relationships: [];
      };
      club_members: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          role: 'standard' | 'admin' | 'moderator';
          added_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          role?: 'standard' | 'admin' | 'moderator';
          added_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
          role?: 'standard' | 'admin' | 'moderator';
          added_at?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          club_id: string;
          google_id: string | null;
          title: string | null;
          authors: string[];
          image_thumbnail: string | null;
          description: string | null;
          page_count: number | null;
          average_rating: number | null;
          ratings_count: number | null;
          published_date: string | null;
          publisher: string | null;
          read_status: 'unread' | 'read' | 'reading' | 'candidate';
          inactive: boolean;
          scheduled_meetings: string[];
          ratings: Json;
          progress_reports: Json;
          added_at: string;
          modified_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          google_id?: string | null;
          title?: string | null;
          authors?: string[];
          image_thumbnail?: string | null;
          description?: string | null;
          page_count?: number | null;
          average_rating?: number | null;
          ratings_count?: number | null;
          published_date?: string | null;
          publisher?: string | null;
          read_status?: 'unread' | 'read' | 'reading' | 'candidate';
          inactive?: boolean;
          scheduled_meetings?: string[];
          ratings?: Json;
          progress_reports?: Json;
          added_at?: string;
          modified_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          google_id?: string | null;
          title?: string | null;
          authors?: string[];
          image_thumbnail?: string | null;
          description?: string | null;
          page_count?: number | null;
          average_rating?: number | null;
          ratings_count?: number | null;
          published_date?: string | null;
          publisher?: string | null;
          read_status?: 'unread' | 'read' | 'reading' | 'candidate';
          inactive?: boolean;
          scheduled_meetings?: string[];
          ratings?: Json;
          progress_reports?: Json;
          added_at?: string;
          modified_at?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          club_id: string;
          date: string | null;
          location_address: string | null;
          location_lat: number | null;
          location_lng: number | null;
          remote_link: string | null;
          remote_password: string | null;
          comments: Json;
          created_at: string;
          modified_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          date?: string | null;
          location_address?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          remote_link?: string | null;
          remote_password?: string | null;
          comments?: Json;
          created_at?: string;
          modified_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          date?: string | null;
          location_address?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          remote_link?: string | null;
          remote_password?: string | null;
          comments?: Json;
          created_at?: string;
          modified_at?: string;
        };
        Relationships: [];
      };
      user_presence: {
        Row: {
          user_id: string;
          last_online_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          last_online_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          last_online_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
