export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          earned_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          roles: string[]
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          roles?: string[]
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          roles?: string[]
          title?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_option_id: string
          created_at: string
          difficulty: string
          error_count: number
          explanation: string | null
          id: string
          module_id: string
          options: Json
          playbook_ref: string | null
          roles: string[]
          text: string
          updated_at: string
        }
        Insert: {
          correct_option_id: string
          created_at?: string
          difficulty?: string
          error_count?: number
          explanation?: string | null
          id?: string
          module_id: string
          options?: Json
          playbook_ref?: string | null
          roles?: string[]
          text: string
          updated_at?: string
        }
        Update: {
          correct_option_id?: string
          created_at?: string
          difficulty?: string
          error_count?: number
          explanation?: string | null
          id?: string
          module_id?: string
          options?: Json
          playbook_ref?: string | null
          roles?: string[]
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_attempts: {
        Row: {
          choices: Json
          completed_at: string | null
          id: string
          is_perfect: boolean
          simulation_id: string
          started_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          choices?: Json
          completed_at?: string | null
          id?: string
          is_perfect?: boolean
          simulation_id: string
          started_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          choices?: Json
          completed_at?: string | null
          id?: string
          is_perfect?: boolean
          simulation_id?: string
          started_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "simulation_attempts_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_steps: {
        Row: {
          consequences: Json
          created_at: string
          depth_level: number
          id: string
          is_root: boolean
          options: Json
          parent_option_id: string | null
          parent_step_id: string | null
          simulation_id: string
          situation_text: string
        }
        Insert: {
          consequences?: Json
          created_at?: string
          depth_level?: number
          id?: string
          is_root?: boolean
          options?: Json
          parent_option_id?: string | null
          parent_step_id?: string | null
          simulation_id: string
          situation_text: string
        }
        Update: {
          consequences?: Json
          created_at?: string
          depth_level?: number
          id?: string
          is_root?: boolean
          options?: Json
          parent_option_id?: string | null
          parent_step_id?: string | null
          simulation_id?: string
          situation_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_steps_parent_step_id_fkey"
            columns: ["parent_step_id"]
            isOneToOne: false
            referencedRelation: "simulation_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_steps_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          created_at: string
          description: string
          id: string
          module_id: string
          roles: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          module_id: string
          roles?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          module_id?: string
          roles?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulations_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      test_answers: {
        Row: {
          attempt_id: string
          attempt_number: number
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_option_id: string
          xp_earned: number
        }
        Insert: {
          attempt_id: string
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_option_id: string
          xp_earned?: number
        }
        Update: {
          attempt_id?: string
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "test_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_attempts: {
        Row: {
          completed_at: string | null
          id: string
          module_id: string
          score: number
          started_at: string
          total_questions: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          id?: string
          module_id: string
          score?: number
          started_at?: string
          total_questions?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string | null
          id?: string
          module_id?: string
          score?: number
          started_at?: string
          total_questions?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          level: number
          max_streak: number
          name: string
          role: string
          updated_at: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          level?: number
          max_streak?: number
          name: string
          role: string
          updated_at?: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          level?: number
          max_streak?: number
          name?: string
          role?: string
          updated_at?: string
          xp?: number
        }
        Relationships: []
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
