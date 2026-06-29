// Hand-maintained until `supabase gen types typescript` is available locally.
// GenericTable requires: Row, Insert, Update, Relationships: []
// GenericSchema requires: Tables, Views, Functions

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          current_streak: number;
          best_streak: number;
          onboarded: boolean;
        };
        Insert: { id: string; username?: string; avatar_url?: string | null; current_streak?: number; best_streak?: number; onboarded?: boolean };
        Update: { username?: string; avatar_url?: string | null; current_streak?: number; best_streak?: number; onboarded?: boolean };
        Relationships: [];
      };

      habits: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          level: "facile" | "moyen" | "difficile";
          weight: number;
          scope: "perso" | "commune";
          group_id: string | null;
          is_active: boolean;
          frequency: "daily" | "specific_days" | "x_per_week";
          frequency_days: number[] | null;
          frequency_x: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          level: "facile" | "moyen" | "difficile";
          weight?: number;
          scope?: "perso" | "commune";
          group_id?: string | null;
          is_active?: boolean;
          frequency?: "daily" | "specific_days" | "x_per_week";
          frequency_days?: number[] | null;
          frequency_x?: number | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          level?: "facile" | "moyen" | "difficile";
          weight?: number;
          scope?: "perso" | "commune";
          group_id?: string | null;
          is_active?: boolean;
          frequency?: "daily" | "specific_days" | "x_per_week";
          frequency_days?: number[] | null;
          frequency_x?: number | null;
        };
        Relationships: [];
      };

      habit_logs: {
        Row: { id: string; habit_id: string; user_id: string; log_date: string; status: boolean; created_at: string };
        Insert: { id?: string; habit_id: string; user_id: string; log_date: string; status?: boolean };
        Update: { status?: boolean };
        Relationships: [];
      };

      daily_scores: {
        Row: { id: string; user_id: string; score_date: string; score: number; completed: number; planned: number };
        Insert: { id?: string; user_id: string; score_date: string; score?: number; completed?: number; planned?: number };
        Update: { score?: number; completed?: number; planned?: number };
        Relationships: [];
      };

      groups: {
        Row: { id: string; name: string; description: string | null; invite_code: string; owner_id: string; created_at: string };
        Insert: { id?: string; name: string; description?: string | null; invite_code: string; owner_id: string };
        Update: { name?: string; description?: string | null };
        Relationships: [];
      };

      group_members: {
        Row: { id: string; group_id: string; user_id: string; joined_at: string };
        Insert: { id?: string; group_id: string; user_id: string };
        Update: { joined_at?: string };
        Relationships: [];
      };

      badges: {
        Row: { id: string; code: string; name: string; description: string | null; icon: string | null };
        Insert: { id?: string; code: string; name: string; description?: string | null; icon?: string | null };
        Update: { name?: string; description?: string | null; icon?: string | null };
        Relationships: [];
      };

      user_badges: {
        Row: { id: string; user_id: string; badge_id: string; earned_at: string };
        Insert: { id?: string; user_id: string; badge_id: string; earned_at?: string };
        Update: { earned_at?: string };
        Relationships: [];
      };

      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target_value: number;
          current_value: number;
          unit: string | null;
          deadline: string | null;
          is_done: boolean;
          created_at: string;
        };
        Insert: { id?: string; user_id: string; title: string; target_value: number; current_value?: number; unit?: string | null; deadline?: string | null; is_done?: boolean };
        Update: { title?: string; target_value?: number; current_value?: number; unit?: string | null; deadline?: string | null; is_done?: boolean };
        Relationships: [];
      };
    };

    Views: {
      // No views currently — required by GenericSchema
      [key: string]: never;
    };

    Functions: {
      group_leaderboard: {
        Args: { p_group: string; p_today: string };
        Returns: Array<{ user_id: string; username: string; avatar_url: string | null; streak: number; today_score: number; week_score: number }>;
      };
      delete_group: {
        Args: { p_group: string };
        Returns: undefined;
      };
      remove_member: {
        Args: { p_group: string; p_user: string };
        Returns: undefined;
      };
      is_habit_scheduled: {
        Args: { h_frequency: string; h_frequency_days: number[] | null; h_frequency_x: number | null; d: string };
        Returns: boolean;
      };
      create_group: {
        Args: { p_name: string };
        Returns: string;
      };
      join_group_by_code: {
        Args: { p_code: string };
        Returns: string;
      };
      add_member_by_username: {
        Args: { p_group: string; p_username: string };
        Returns: undefined;
      };
      leave_group: {
        Args: { p_group: string };
        Returns: undefined;
      };
    };
  };
}

// Utility helpers — mirror names from supabase generated types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

import type { SupabaseClient } from "@supabase/supabase-js";
export type TypedDb = SupabaseClient<Database>;
