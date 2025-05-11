export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      notes: {
        Row: {
          author_id: string;
          content: string;
          created_at: string;
          id: string;
          patient_id: string;
          visit_id: string | null;
        };
        Insert: {
          author_id: string;
          content: string;
          created_at?: string;
          id?: string;
          patient_id: string;
          visit_id?: string | null;
        };
        Update: {
          author_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          patient_id?: string;
          visit_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notes_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notes_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "visits";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          date_of_birth: string;
          deleted_at: string | null;
          first_name: string;
          last_name: string;
          phone: string;
          role: Database["public"]["Enums"]["role_enum"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          date_of_birth: string;
          deleted_at?: string | null;
          first_name: string;
          last_name: string;
          phone: string;
          role: Database["public"]["Enums"]["role_enum"];
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          date_of_birth?: string;
          deleted_at?: string | null;
          first_name?: string;
          last_name?: string;
          phone?: string;
          role?: Database["public"]["Enums"]["role_enum"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      time_blocks: {
        Row: {
          created_at: string;
          created_by: string;
          end_time: string;
          id: string;
          start_time: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          end_time: string;
          id?: string;
          start_time: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          end_time?: string;
          id?: string;
          start_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_blocks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      visits: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          end_time: string;
          id: string;
          patient_id: string;
          purpose: string | null;
          start_time: string;
          status: Database["public"]["Enums"]["status_enum"];
          updated_at: string;
          visit_type: Database["public"]["Enums"]["visit_type_enum"];
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          end_time: string;
          id?: string;
          patient_id: string;
          purpose?: string | null;
          start_time: string;
          status?: Database["public"]["Enums"]["status_enum"];
          updated_at?: string;
          visit_type?: Database["public"]["Enums"]["visit_type_enum"];
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          end_time?: string;
          id?: string;
          patient_id?: string;
          purpose?: string | null;
          start_time?: string;
          status?: Database["public"]["Enums"]["status_enum"];
          updated_at?: string;
          visit_type?: Database["public"]["Enums"]["visit_type_enum"];
        };
        Relationships: [
          {
            foreignKeyName: "visits_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      work_schedule: {
        Row: {
          day_of_week: number;
          end_time: string;
          id: string;
          start_time: string;
        };
        Insert: {
          day_of_week: number;
          end_time: string;
          id?: string;
          start_time: string;
        };
        Update: {
          day_of_week?: number;
          end_time?: string;
          id?: string;
          start_time?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      role_enum: "role_patient" | "role_worker";
      status_enum: "scheduled" | "canceled" | "completed";
      visit_type_enum: "first_time" | "follow_up";
    };
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      role_enum: ["role_patient", "role_worker"],
      status_enum: ["scheduled", "canceled", "completed"],
      visit_type_enum: ["first_time", "follow_up"],
    },
  },
} as const;
