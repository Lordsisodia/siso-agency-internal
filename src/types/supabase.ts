// Generated Supabase Database Types - Core Tables
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      deep_work_tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          user_id: string
          task_date: string
          original_date: string
          completed: boolean | null
          priority: Database["public"]["Enums"]["priority"] | null
          category: string | null
          estimated_duration: number | null
          actual_duration_min: number | null
          tags: string[] | null
          created_at: string | null
          updated_at: string | null
          completed_at: string | null
          started_at: string | null
          complexity: number | null
          confidence: number | null
          difficulty: number | null
          learning_value: number | null
          strategic_importance: number | null
          contextual_bonus: number | null
          priority_rank: number | null
          xp_reward: number | null
          time_accuracy: number | null
          ai_analyzed: boolean | null
          ai_reasoning: string | null
          analyzed_at: string | null
          rollovers: number | null
          focus_blocks: number | null
          break_duration: number | null
          interruption_mode: boolean | null
          time_estimate: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          user_id: string
          task_date: string
          original_date: string
          completed?: boolean | null
          priority?: Database["public"]["Enums"]["priority"] | null
          category?: string | null
          estimated_duration?: number | null
          actual_duration_min?: number | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
          started_at?: string | null
          complexity?: number | null
          confidence?: number | null
          difficulty?: number | null
          learning_value?: number | null
          strategic_importance?: number | null
          contextual_bonus?: number | null
          priority_rank?: number | null
          xp_reward?: number | null
          time_accuracy?: number | null
          ai_analyzed?: boolean | null
          ai_reasoning?: string | null
          analyzed_at?: string | null
          rollovers?: number | null
          focus_blocks?: number | null
          break_duration?: number | null
          interruption_mode?: boolean | null
          time_estimate?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          user_id?: string
          task_date?: string
          original_date?: string
          completed?: boolean | null
          priority?: Database["public"]["Enums"]["priority"] | null
          category?: string | null
          estimated_duration?: number | null
          actual_duration_min?: number | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
          started_at?: string | null
          complexity?: number | null
          confidence?: number | null
          difficulty?: number | null
          learning_value?: number | null
          strategic_importance?: number | null
          contextual_bonus?: number | null
          priority_rank?: number | null
          xp_reward?: number | null
          time_accuracy?: number | null
          ai_analyzed?: boolean | null
          ai_reasoning?: string | null
          analyzed_at?: string | null
          rollovers?: number | null
          focus_blocks?: number | null
          break_duration?: number | null
          interruption_mode?: boolean | null
          time_estimate?: string | null
        }
        Relationships: []
      }
      light_work_tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          user_id: string
          task_date: string
          original_date: string
          completed: boolean | null
          priority: Database["public"]["Enums"]["priority"] | null
          category: string | null
          estimated_duration: number | null
          actual_duration_min: number | null
          tags: string[] | null
          created_at: string | null
          updated_at: string | null
          completed_at: string | null
          started_at: string | null
          complexity: number | null
          confidence: number | null
          difficulty: number | null
          learning_value: number | null
          strategic_importance: number | null
          contextual_bonus: number | null
          priority_rank: number | null
          xp_reward: number | null
          time_accuracy: number | null
          ai_analyzed: boolean | null
          ai_reasoning: string | null
          analyzed_at: string | null
          rollovers: number | null
          due_date: string | null
          time_estimate: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          user_id: string
          task_date: string
          original_date: string
          completed?: boolean | null
          priority?: Database["public"]["Enums"]["priority"] | null
          category?: string | null
          estimated_duration?: number | null
          actual_duration_min?: number | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
          started_at?: string | null
          complexity?: number | null
          confidence?: number | null
          difficulty?: number | null
          learning_value?: number | null
          strategic_importance?: number | null
          contextual_bonus?: number | null
          priority_rank?: number | null
          xp_reward?: number | null
          time_accuracy?: number | null
          ai_analyzed?: boolean | null
          ai_reasoning?: string | null
          analyzed_at?: string | null
          rollovers?: number | null
          due_date?: string | null
          time_estimate?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          user_id?: string
          task_date?: string
          original_date?: string
          completed?: boolean | null
          priority?: Database["public"]["Enums"]["priority"] | null
          category?: string | null
          estimated_duration?: number | null
          actual_duration_min?: number | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
          started_at?: string | null
          complexity?: number | null
          confidence?: number | null
          difficulty?: number | null
          learning_value?: number | null
          strategic_importance?: number | null
          contextual_bonus?: number | null
          priority_rank?: number | null
          xp_reward?: number | null
          time_accuracy?: number | null
          ai_analyzed?: boolean | null
          ai_reasoning?: string | null
          analyzed_at?: string | null
          rollovers?: number | null
          due_date?: string | null
          time_estimate?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          supabase_id: string
          display_name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          supabase_id: string
          display_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          supabase_id?: string
          display_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workout_items: {
        Row: {
          id: string
          user_id: string
          workout_date: string
          title: string
          completed: boolean
          target: string | null
          logged: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workout_date: string
          title: string
          completed?: boolean
          target?: string | null
          logged?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_date?: string
          title?: string
          completed?: boolean
          target?: string | null
          logged?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      user_role: "admin" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]

// Task-specific types for convenience
export type DeepWorkTask = Tables<"deep_work_tasks">
export type LightWorkTask = Tables<"light_work_tasks">  
export type User = Tables<"users">
export type Priority = Enums<"priority">
export type UserRole = Enums<"user_role"> 