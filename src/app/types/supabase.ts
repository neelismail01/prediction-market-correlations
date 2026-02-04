export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      events: {
        Row: {
          available_on_brokers: boolean
          collateral_return_type: string | null
          exchange_id: number
          id: number
          mutually_exclusive: boolean
          series_id: number | null
          strike_date: string | null
          strike_period: string | null
          sub_title: string | null
          ticker: string
          title: string | null
        }
        Insert: {
          available_on_brokers?: boolean
          collateral_return_type?: string | null
          exchange_id: number
          id?: number
          mutually_exclusive?: boolean
          series_id?: number | null
          strike_date?: string | null
          strike_period?: string | null
          sub_title?: string | null
          ticker: string
          title?: string | null
        }
        Update: {
          available_on_brokers?: boolean
          collateral_return_type?: string | null
          exchange_id?: number
          id?: number
          mutually_exclusive?: boolean
          series_id?: number
          strike_date?: string | null
          strike_period?: string | null
          sub_title?: string | null
          ticker?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchanges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      exchanges: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      market_snapshots: {
        Row: {
          id: number
          last_price: number | null
          last_price_dollars: number | null
          liquidity: number | null
          liquidity_dollars: number | null
          market_id: number
          no_ask: number | null
          no_ask_dollars: number | null
          no_bid: number | null
          no_bid_dollars: number | null
          notional_value: number | null
          notional_value_dollars: number | null
          open_interest: number | null
          open_interest_fp: number | null
          previous_price: number | null
          previous_price_dollars: number | null
          previous_yes_ask: number | null
          previous_yes_ask_dollars: number | null
          previous_yes_bid: number | null
          previous_yes_bid_dollars: number | null
          volume: number | null
          volume_24h: number | null
          volume_24h_fp: number | null
          volume_fp: number | null
          yes_ask: number | null
          yes_ask_dollars: number | null
          yes_bid: number | null
          yes_bid_dollars: number | null
        }
        Insert: {
          id?: number
          last_price?: number | null
          last_price_dollars?: number | null
          liquidity?: number | null
          liquidity_dollars?: number | null
          market_id: number
          no_ask?: number | null
          no_ask_dollars?: number | null
          no_bid?: number | null
          no_bid_dollars?: number | null
          notional_value?: number | null
          notional_value_dollars?: number | null
          open_interest?: number | null
          open_interest_fp?: number | null
          previous_price?: number | null
          previous_price_dollars?: number | null
          previous_yes_ask?: number | null
          previous_yes_ask_dollars?: number | null
          previous_yes_bid?: number | null
          previous_yes_bid_dollars?: number | null
          volume?: number | null
          volume_24h?: number | null
          volume_24h_fp?: number | null
          volume_fp?: number | null
          yes_ask?: number | null
          yes_ask_dollars?: number | null
          yes_bid?: number | null
          yes_bid_dollars?: number | null
        }
        Update: {
          id?: number
          last_price?: number | null
          last_price_dollars?: number | null
          liquidity?: number | null
          liquidity_dollars?: number | null
          market_id?: number
          no_ask?: number | null
          no_ask_dollars?: number | null
          no_bid?: number | null
          no_bid_dollars?: number | null
          notional_value?: number | null
          notional_value_dollars?: number | null
          open_interest?: number | null
          open_interest_fp?: number | null
          previous_price?: number | null
          previous_price_dollars?: number | null
          previous_yes_ask?: number | null
          previous_yes_ask_dollars?: number | null
          previous_yes_bid?: number | null
          previous_yes_bid_dollars?: number | null
          volume?: number | null
          volume_24h?: number | null
          volume_24h_fp?: number | null
          volume_fp?: number | null
          yes_ask?: number | null
          yes_ask_dollars?: number | null
          yes_bid?: number | null
          yes_bid_dollars?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_snapshots_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          can_close_early: boolean | null
          cap_strike: number | null
          close_time: string | null
          created_time: string | null
          early_close_condition: string | null
          event_id: number
          expected_expiration_time: string | null
          expiration_time: string | null
          expiration_value: string | null
          fee_waiver_expiration_time: string | null
          floor_strike: number | null
          id: number
          is_provisional: boolean | null
          latest_expiration_time: string | null
          market_type: string | null
          mve_collection_ticker: string | null
          no_sub_title: string | null
          open_time: string | null
          price_level_structure: string | null
          response_price_units: string | null
          result: string | null
          rules_primary: string | null
          rules_secondary: string | null
          settlement_timer_seconds: number | null
          settlement_ts: string | null
          settlement_value_dollars: number | null
          status: string | null
          strike_type: string | null
          subtitle: string | null
          tick_size: number | null
          ticker: string
          title: string | null
          updated_time: string | null
          yes_sub_title: string | null
        }
        Insert: {
          can_close_early?: boolean | null
          cap_strike?: number | null
          close_time?: string | null
          created_time?: string | null
          early_close_condition?: string | null
          event_id: number
          expected_expiration_time?: string | null
          expiration_time?: string | null
          expiration_value?: string | null
          fee_waiver_expiration_time?: string | null
          floor_strike?: number | null
          id?: number
          is_provisional?: boolean | null
          latest_expiration_time?: string | null
          market_type?: string | null
          mve_collection_ticker?: string | null
          no_sub_title?: string | null
          open_time?: string | null
          price_level_structure?: string | null
          response_price_units?: string | null
          result?: string | null
          rules_primary?: string | null
          rules_secondary?: string | null
          settlement_timer_seconds?: number | null
          settlement_ts?: string | null
          settlement_value_dollars?: number | null
          status?: string | null
          strike_type?: string | null
          subtitle?: string | null
          tick_size?: number | null
          ticker: string
          title?: string | null
          updated_time?: string | null
          yes_sub_title?: string | null
        }
        Update: {
          can_close_early?: boolean | null
          cap_strike?: number | null
          close_time?: string | null
          created_time?: string | null
          early_close_condition?: string | null
          event_id?: number
          expected_expiration_time?: string | null
          expiration_time?: string | null
          expiration_value?: string | null
          fee_waiver_expiration_time?: string | null
          floor_strike?: number | null
          id?: number
          is_provisional?: boolean | null
          latest_expiration_time?: string | null
          market_type?: string | null
          mve_collection_ticker?: string | null
          no_sub_title?: string | null
          open_time?: string | null
          price_level_structure?: string | null
          response_price_units?: string | null
          result?: string | null
          rules_primary?: string | null
          rules_secondary?: string | null
          settlement_timer_seconds?: number | null
          settlement_ts?: string | null
          settlement_value_dollars?: number | null
          status?: string | null
          strike_type?: string | null
          subtitle?: string | null
          tick_size?: number | null
          ticker?: string
          title?: string | null
          updated_time?: string | null
          yes_sub_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          category: string | null
          contract_terms_url: string | null
          contract_url: string | null
          created_at: string | null
          exchange_id: number
          fee_multiplier: number | null
          fee_type: string | null
          frequency: string | null
          id: number
          ticker: string
          title: string | null
          updated_at: string | null
          volume: number | null
          volume_fp: string | null
        }
        Insert: {
          category?: string | null
          contract_terms_url?: string | null
          contract_url?: string | null
          created_at?: string | null
          exchange_id: number
          fee_multiplier?: number | null
          fee_type?: string | null
          frequency?: string | null
          id?: number
          ticker: string
          title?: string | null
          updated_at?: string | null
          volume?: number | null
          volume_fp?: string | null
        }
        Update: {
          category?: string | null
          contract_terms_url?: string | null
          contract_url?: string | null
          created_at?: string | null
          exchange_id?: number
          fee_multiplier?: number | null
          fee_type?: string | null
          frequency?: string | null
          id?: number
          ticker?: string
          title?: string | null
          updated_at?: string | null
          volume?: number | null
          volume_fp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "series_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchanges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

// Clean aliases for your "Rows" (the data you GET)
export type SupabaseEventRow = Tables<'events'>
export type SupabaseExchangeRow = Tables<'exchanges'>
export type SupabaseMarketRow = Tables<'markets'>
export type SupabaseMarketSnapshotRow = Tables<'market_snapshots'>
export type SupabaseSeriesRow = Tables<'series'>

// If you need types for INSERTING data
export type SupabaseEventInsert = TablesInsert<'events'>

// If you need types for UPDATING data
export type SupabaseEventUpdate = TablesUpdate<'events'>