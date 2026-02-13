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
      characters: {
        Row: {
          acrobatics: number
          action_points: number
          aim: number
          alteration: number
          backstory: string | null
          bartering: number
          beastmastery: number
          betrayers_defeated: string[]
          bloodmancy: number
          bravery: number
          brawling: number
          character_class: string | null
          climbing: number
          created_at: string
          current_zone: string | null
          defense: number | null
          destruction: number
          gold: number
          honor: number
          hp: number
          id: string
          illusion: number
          infamy: number
          intimidation: number
          investigation: number
          justice: number
          level: number
          loyalty: number
          magic: number | null
          malice: number
          mana: number
          max_action_points: number
          max_hp: number
          max_mana: number
          max_stamina: number
          mercy: number
          name: string
          necromancy: number
          offense: number | null
          one_handed: number
          persuasion: number
          regeneration: number
          seduction: number
          sleight_of_hand: number
          soulbinding: number
          stamina: number
          stat_points: number
          stealth: number
          story_phase: string
          two_handed: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          acrobatics?: number
          action_points?: number
          aim?: number
          alteration?: number
          backstory?: string | null
          bartering?: number
          beastmastery?: number
          betrayers_defeated?: string[]
          bloodmancy?: number
          bravery?: number
          brawling?: number
          character_class?: string | null
          climbing?: number
          created_at?: string
          current_zone?: string | null
          defense?: number | null
          destruction?: number
          gold?: number
          honor?: number
          hp?: number
          id?: string
          illusion?: number
          infamy?: number
          intimidation?: number
          investigation?: number
          justice?: number
          level?: number
          loyalty?: number
          magic?: number | null
          malice?: number
          mana?: number
          max_action_points?: number
          max_hp?: number
          max_mana?: number
          max_stamina?: number
          mercy?: number
          name?: string
          necromancy?: number
          offense?: number | null
          one_handed?: number
          persuasion?: number
          regeneration?: number
          seduction?: number
          sleight_of_hand?: number
          soulbinding?: number
          stamina?: number
          stat_points?: number
          stealth?: number
          story_phase?: string
          two_handed?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          acrobatics?: number
          action_points?: number
          aim?: number
          alteration?: number
          backstory?: string | null
          bartering?: number
          beastmastery?: number
          betrayers_defeated?: string[]
          bloodmancy?: number
          bravery?: number
          brawling?: number
          character_class?: string | null
          climbing?: number
          created_at?: string
          current_zone?: string | null
          defense?: number | null
          destruction?: number
          gold?: number
          honor?: number
          hp?: number
          id?: string
          illusion?: number
          infamy?: number
          intimidation?: number
          investigation?: number
          justice?: number
          level?: number
          loyalty?: number
          magic?: number | null
          malice?: number
          mana?: number
          max_action_points?: number
          max_hp?: number
          max_mana?: number
          max_stamina?: number
          mercy?: number
          name?: string
          necromancy?: number
          offense?: number | null
          one_handed?: number
          persuasion?: number
          regeneration?: number
          seduction?: number
          sleight_of_hand?: number
          soulbinding?: number
          stamina?: number
          stat_points?: number
          stealth?: number
          story_phase?: string
          two_handed?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          character_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          character_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          character_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      companions: {
        Row: {
          character_id: string
          created_at: string
          defense: number
          description: string | null
          hp: number
          icon: string
          id: string
          is_active: boolean
          magic: number
          mana: number
          max_hp: number
          max_mana: number
          max_stamina: number
          name: string
          offense: number
          personality: string
          stamina: number
          trust: number
          updated_at: string
        }
        Insert: {
          character_id: string
          created_at?: string
          defense?: number
          description?: string | null
          hp?: number
          icon?: string
          id?: string
          is_active?: boolean
          magic?: number
          mana?: number
          max_hp?: number
          max_mana?: number
          max_stamina?: number
          name: string
          offense?: number
          personality?: string
          stamina?: number
          trust?: number
          updated_at?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          defense?: number
          description?: string | null
          hp?: number
          icon?: string
          id?: string
          is_active?: boolean
          magic?: number
          mana?: number
          max_hp?: number
          max_mana?: number
          max_stamina?: number
          name?: string
          offense?: number
          personality?: string
          stamina?: number
          trust?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companions_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          character_id: string
          created_at: string
          description: string | null
          icon: string
          id: string
          item_type: string
          name: string
          quantity: number
        }
        Insert: {
          character_id: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          item_type?: string
          name: string
          quantity?: number
        }
        Update: {
          character_id?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          item_type?: string
          name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          character_id: string
          content: string
          created_at: string
          entry_number: number
          id: string
          title: string
        }
        Insert: {
          character_id: string
          content: string
          created_at?: string
          entry_number?: number
          id?: string
          title: string
        }
        Update: {
          character_id?: string
          content?: string
          created_at?: string
          entry_number?: number
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
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
