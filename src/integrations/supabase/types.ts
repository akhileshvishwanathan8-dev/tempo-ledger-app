export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          date: string
          description: string
          gig_id: string | null
          id: string
          paid_by: string | null
          receipt_url: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          date?: string
          description: string
          gig_id?: string | null
          id?: string
          paid_by?: string | null
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          gig_id?: string | null
          id?: string
          paid_by?: string | null
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_availability: {
        Row: {
          created_at: string
          gig_id: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gig_id: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gig_id?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_availability_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_setlists: {
        Row: {
          created_at: string
          created_by: string | null
          gig_id: string
          id: string
          notes: string | null
          position: number
          song_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          gig_id: string
          id?: string
          notes?: string | null
          position?: number
          song_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          gig_id?: string
          id?: string
          notes?: string | null
          position?: number
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_setlists_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_setlists_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          address: string | null
          city: string
          confirmed_amount: number | null
          contract_url: string | null
          created_at: string
          created_by: string | null
          date: string
          end_time: string | null
          id: string
          notes: string | null
          organizer_email: string | null
          organizer_name: string | null
          organizer_phone: string | null
          quoted_amount: number | null
          start_time: string | null
          status: string
          tds_percentage: number | null
          title: string
          updated_at: string
          venue: string
        }
        Insert: {
          address?: string | null
          city: string
          confirmed_amount?: number | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          end_time?: string | null
          id?: string
          notes?: string | null
          organizer_email?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          quoted_amount?: number | null
          start_time?: string | null
          status?: string
          tds_percentage?: number | null
          title: string
          updated_at?: string
          venue: string
        }
        Update: {
          address?: string | null
          city?: string
          confirmed_amount?: number | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          organizer_email?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          quoted_amount?: number | null
          start_time?: string | null
          status?: string
          tds_percentage?: number | null
          title?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          gig_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_mode: string | null
          recorded_by: string | null
          reference_number: string | null
          tds_deducted: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          gig_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          tds_deducted?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          gig_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          tds_deducted?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          gig_id: string
          id: string
          notes: string | null
          paid_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          gig_id: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          gig_id?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      song_versions: {
        Row: {
          audio_url: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          song_id: string
          version_name: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          song_id: string
          version_name: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          song_id?: string
          version_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_versions_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          arranger: string | null
          audio_url: string | null
          chords: string | null
          composer: string | null
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          id: string
          is_original: boolean | null
          key_signature: string | null
          lyrics: string | null
          performance_notes: string | null
          raga: string | null
          sheet_music_url: string | null
          structure: string | null
          tala: string | null
          tempo: number | null
          title: string
          updated_at: string
        }
        Insert: {
          arranger?: string | null
          audio_url?: string | null
          chords?: string | null
          composer?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          is_original?: boolean | null
          key_signature?: string | null
          lyrics?: string | null
          performance_notes?: string | null
          raga?: string | null
          sheet_music_url?: string | null
          structure?: string | null
          tala?: string | null
          tempo?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          arranger?: string | null
          audio_url?: string | null
          chords?: string | null
          composer?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          is_original?: boolean | null
          key_signature?: string | null
          lyrics?: string | null
          performance_notes?: string | null
          raga?: string | null
          sheet_music_url?: string | null
          structure?: string | null
          tala?: string | null
          tempo?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_gig_financials: {
        Args: { gig_uuid: string }
        Returns: {
          balance_due: number
          gross_amount: number
          member_count: number
          net_amount: number
          per_member_share: number
          total_expenses: number
          total_payments: number
          total_tds: number
        }[]
      }
      generate_gig_payouts: { Args: { gig_uuid: string }; Returns: undefined }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "musician" | "external_viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "musician", "external_viewer"],
    },
  },
} as const
