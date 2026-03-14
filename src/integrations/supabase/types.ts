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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      call_logs: {
        Row: {
          attempt_number: number | null
          call_analysis: Json | null
          campaign_id: string | null
          cost: number | null
          created_at: string
          disconnection_reason: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          lead_id: string | null
          lead_name: string | null
          lead_phone: string | null
          retell_call_id: string | null
          sentiment: string | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          attempt_number?: number | null
          call_analysis?: Json | null
          campaign_id?: string | null
          cost?: number | null
          created_at?: string
          disconnection_reason?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          retell_call_id?: string | null
          sentiment?: string | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          attempt_number?: number | null
          call_analysis?: Json | null
          campaign_id?: string | null
          cost?: number | null
          created_at?: string
          disconnection_reason?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          retell_call_id?: string | null
          sentiment?: string | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_leads: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          lead_id: string
          next_retry_at: string | null
          retell_call_id: string | null
          retry_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          lead_id: string
          next_retry_at?: string | null
          retell_call_id?: string | null
          retry_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          lead_id?: string
          next_retry_at?: string | null
          retell_call_id?: string | null
          retry_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          appointments_booked: number | null
          call_interval_minutes: number | null
          calls_completed: number | null
          cost: number | null
          created_at: string
          id: string
          lead_count: number | null
          lead_list: string | null
          max_retries: number | null
          name: string
          retry_delay: number | null
          script_id: string | null
          script_name: string | null
          status: string
          timezone: string | null
          type: string
          updated_at: string
          user_id: string
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          appointments_booked?: number | null
          call_interval_minutes?: number | null
          calls_completed?: number | null
          cost?: number | null
          created_at?: string
          id?: string
          lead_count?: number | null
          lead_list?: string | null
          max_retries?: number | null
          name: string
          retry_delay?: number | null
          script_id?: string | null
          script_name?: string | null
          status?: string
          timezone?: string | null
          type: string
          updated_at?: string
          user_id: string
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          appointments_booked?: number | null
          call_interval_minutes?: number | null
          calls_completed?: number | null
          cost?: number | null
          created_at?: string
          id?: string
          lead_count?: number | null
          lead_list?: string | null
          max_retries?: number | null
          name?: string
          retry_delay?: number | null
          script_id?: string | null
          script_name?: string | null
          status?: string
          timezone?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      credit_purchase_requests: {
        Row: {
          base_credits: number
          bonus_credits: number
          created_at: string
          id: string
          pack_name: string
          payment_status: string
          request_status: string
          total_credits: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_credits: number
          bonus_credits?: number
          created_at?: string
          id?: string
          pack_name: string
          payment_status?: string
          request_status?: string
          total_credits: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_credits?: number
          bonus_credits?: number
          created_at?: string
          id?: string
          pack_name?: string
          payment_status?: string
          request_status?: string
          total_credits?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          call_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          source: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          call_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          call_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          campaign: string | null
          city: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          next_retry_at: string | null
          notes: string | null
          phone: string
          retell_call_id: string | null
          retry_count: number | null
          source: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          next_retry_at?: string | null
          notes?: string | null
          phone: string
          retell_call_id?: string | null
          retry_count?: number | null
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          next_retry_at?: string | null
          notes?: string | null
          phone?: string
          retell_call_id?: string | null
          retry_count?: number | null
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_number_purchases: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          campaign_id: string | null
          campaign_name: string | null
          created_at: string
          credits_deducted: number
          expires_at: string
          id: string
          phone_number: string
          phone_number_id: string
          purchased_at: string
          status: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string
          credits_deducted?: number
          expires_at?: string
          id?: string
          phone_number: string
          phone_number_id: string
          purchased_at?: string
          status?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string
          credits_deducted?: number
          expires_at?: string
          id?: string
          phone_number?: string
          phone_number_id?: string
          purchased_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance_credits: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_credits?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_credits?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          api_key: string
          created_at: string
          id: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      admin_adjust_credits: {
        Args: {
          p_admin_id: string
          p_amount: number
          p_reason?: string
          p_user_id: string
        }
        Returns: Json
      }
      deduct_call_credits: {
        Args: {
          p_call_id: string
          p_campaign_id?: string
          p_duration_seconds: number
          p_user_id: string
        }
        Returns: Json
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
