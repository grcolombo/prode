export type Role = "employee" | "client";

export type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "third" | "final";

export interface Database {
  public: {
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          alias: string | null;
          role: Role;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          alias?: string | null;
          role: Role;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          alias?: string | null;
          role?: Role;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: number;
          stage: Stage;
          group_name: string | null;
          match_number: number;
          round: number | null;
          slot_label: string | null;
          home_team: string | null;
          away_team: string | null;
          home_flag: string | null;
          away_flag: string | null;
          scheduled_at: string;
          home_score_real: number | null;
          away_score_real: number | null;
          is_played: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["matches"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["matches"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
      predictions: {
        Row: {
          id: number;
          user_id: string;
          match_id: number;
          home_score: number;
          away_score: number;
          points_earned: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          match_id: number;
          home_score: number;
          away_score: number;
          points_earned?: number | null;
        };
        Update: {
          home_score?: number;
          away_score?: number;
          points_earned?: number | null;
        };
        Relationships: [];
      };
      employee_emails: {
        Row: { email: string };
        Insert: { email: string };
        Update: { email?: string };
        Relationships: [];
      };
    };
    Functions: {
      calculate_points: {
        Args: {
          pred_home: number;
          pred_away: number;
          real_home: number;
          real_away: number;
        };
        Returns: number;
      };
    };
  };
}
