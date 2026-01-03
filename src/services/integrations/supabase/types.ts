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
      agency_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_type: string
          metric_value: Json
          period: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_type: string
          metric_value?: Json
          period: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_type?: string
          metric_value?: Json
          period?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_tasks: {
        Row: {
          id: string
          name: string
          description: string | null
          category: 'development' | 'testing' | 'deployment' | 'analysis' | 'maintenance'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
          prompt: string
          allowed_tools: Json
          estimated_tokens: number
          actual_tokens: number | null
          execution_time_ms: number | null
          result: string | null
          error: string | null
          created_by: string
          metadata: Json
          created_at: string
          updated_at: string
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: 'development' | 'testing' | 'deployment' | 'analysis' | 'maintenance'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
          prompt: string
          allowed_tools?: Json
          estimated_tokens?: number
          actual_tokens?: number | null
          execution_time_ms?: number | null
          result?: string | null
          error?: string | null
          created_by: string
          metadata?: Json
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: 'development' | 'testing' | 'deployment' | 'analysis' | 'maintenance'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
          prompt?: string
          allowed_tools?: Json
          estimated_tokens?: number
          actual_tokens?: number | null
          execution_time_ms?: number | null
          result?: string | null
          error?: string | null
          created_by?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_pain_points: {
        Row: {
          agency_type_id: string | null
          created_at: string
          description: string
          icon: string
          id: string
          impact_areas: string[]
          industry_trends: Json | null
          severity: string
          solutions: string[]
          statistic: string
          survey_data: Json
          testimonial: Json | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          agency_type_id?: string | null
          created_at?: string
          description: string
          icon: string
          id?: string
          impact_areas?: string[]
          industry_trends?: Json | null
          severity: string
          solutions?: string[]
          statistic: string
          survey_data?: Json
          testimonial?: Json | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          agency_type_id?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          impact_areas?: string[]
          industry_trends?: Json | null
          severity?: string
          solutions?: string[]
          statistic?: string
          survey_data?: Json
          testimonial?: Json | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_pain_points_agency_type_id_fkey"
            columns: ["agency_type_id"]
            isOneToOne: false
            referencedRelation: "agency_types"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_types: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_requests: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          last_request_at: string | null
          rate_limit_remaining: number | null
          request_count: number | null
          reset_at: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          last_request_at?: string | null
          rate_limit_remaining?: number | null
          request_count?: number | null
          reset_at?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          last_request_at?: string | null
          rate_limit_remaining?: number | null
          request_count?: number | null
          reset_at?: string | null
        }
        Relationships: []
      }
      automated_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          lead_id: string | null
          plan_data: Json | null
          plan_name: string
          plan_status: string | null
          start_date: string | null
          success_metrics: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          lead_id?: string | null
          plan_data?: Json | null
          plan_name: string
          plan_status?: string | null
          start_date?: string | null
          success_metrics?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          lead_id?: string | null
          plan_data?: Json | null
          plan_name?: string
          plan_status?: string | null
          start_date?: string | null
          success_metrics?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_plans_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "instagram_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_default: boolean | null
          metadata: Json | null
          name: string
          template_type: string
          text_overlay: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_default?: boolean | null
          metadata?: Json | null
          name: string
          template_type: string
          text_overlay?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_default?: boolean | null
          metadata?: Json | null
          name?: string
          template_type?: string
          text_overlay?: Json | null
        }
        Relationships: []
      }
      bulk_plan_creations: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          created_plans: number
          failed_plans: number
          id: string
          status: string
          template_id: string | null
          total_plans: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          created_plans?: number
          failed_plans?: number
          id?: string
          status?: string
          template_id?: string | null
          total_plans?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          created_plans?: number
          failed_plans?: number
          id?: string
          status?: string
          template_id?: string | null
          total_plans?: number
        }
        Relationships: [
          {
            foreignKeyName: "bulk_plan_creations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "plan_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          start_time: string
          task_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          task_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          task_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          agency_type_id: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          notion_url: string | null
          title: string
        }
        Insert: {
          agency_type_id?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          notion_url?: string | null
          title: string
        }
        Update: {
          agency_type_id?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          notion_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_agency_type_id_fkey"
            columns: ["agency_type_id"]
            isOneToOne: false
            referencedRelation: "agency_types"
            referencedColumns: ["id"]
          },
        ]
      }
      category_stats: {
        Row: {
          category: string
          community_count: number | null
          id: string
          total_members: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          community_count?: number | null
          id?: string
          total_members?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          community_count?: number | null
          id?: string
          total_members?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_documents: {
        Row: {
          client_id: string
          content: string | null
          created_at: string
          created_by: string | null
          document_type: string
          id: string
          is_pinned: boolean | null
          last_edited_by: string | null
          position: number | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_type: string
          id?: string
          is_pinned?: boolean | null
          last_edited_by?: string | null
          position?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_type?: string
          id?: string
          is_pinned?: boolean | null
          last_edited_by?: string | null
          position?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding: {
        Row: {
          company_name: string | null
          company_niche: string | null
          completed_steps: string[] | null
          contact_name: string | null
          created_at: string | null
          current_step: number | null
          email: string | null
          id: string
          project_name: string | null
          status: string
          todos: Json | null
          total_steps: number | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          company_name?: string | null
          company_niche?: string | null
          completed_steps?: string[] | null
          contact_name?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          id?: string
          project_name?: string | null
          status?: string
          todos?: Json | null
          total_steps?: number | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          company_name?: string | null
          company_niche?: string | null
          completed_steps?: string[] | null
          contact_name?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          id?: string
          project_name?: string | null
          status?: string
          todos?: Json | null
          total_steps?: number | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      client_plans: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          project_plan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          project_plan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          project_plan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_plans_project_plan_id_fkey"
            columns: ["project_plan_id"]
            isOneToOne: false
            referencedRelation: "project_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      client_user_auth: {
        Row: {
          auth_user_id: string | null
          client_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          auth_user_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          auth_user_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_user_auth_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      client_user_links: {
        Row: {
          client_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_user_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_transactions: {
        Row: {
          created_at: string | null
          id: string
          points_exchanged: number
          status: string | null
          tokens_received: number
          transaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_exchanged: number
          status?: string | null
          tokens_received: number
          transaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points_exchanged?: number
          status?: string | null
          tokens_received?: number
          transaction_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      education_creators: {
        Row: {
          channel_avatar_url: string | null
          channel_id: string | null
          created_at: string | null
          description: string | null
          expertise: string[] | null
          id: string
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          channel_avatar_url?: string | null
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          expertise?: string[] | null
          id?: string
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          channel_avatar_url?: string | null
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          expertise?: string[] | null
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          currency: string | null
          date: string
          description: string | null
          id: string
          notes: string | null
          payment_method_id: string | null
          receipt_url: string | null
          recurring_type: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          date: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method_id?: string | null
          receipt_url?: string | null
          recurring_type?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method_id?: string | null
          receipt_url?: string | null
          recurring_type?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      instagram_leads: {
        Row: {
          app_plan_status: string | null
          app_plan_url: string | null
          assigned_to: string | null
          bio: string | null
          commented: boolean | null
          created_at: string | null
          followed: boolean | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          id: string
          is_private: boolean | null
          is_verified: boolean | null
          last_interaction_at: string | null
          last_updated: string | null
          messaged: boolean | null
          notes: string | null
          outreach_account: string | null
          posts_count: number | null
          profile_url: string | null
          status: string | null
          username: string
        }
        Insert: {
          app_plan_status?: string | null
          app_plan_url?: string | null
          assigned_to?: string | null
          bio?: string | null
          commented?: boolean | null
          created_at?: string | null
          followed?: boolean | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string
          is_private?: boolean | null
          is_verified?: boolean | null
          last_interaction_at?: string | null
          last_updated?: string | null
          messaged?: boolean | null
          notes?: string | null
          outreach_account?: string | null
          posts_count?: number | null
          profile_url?: string | null
          status?: string | null
          username: string
        }
        Update: {
          app_plan_status?: string | null
          app_plan_url?: string | null
          assigned_to?: string | null
          bio?: string | null
          commented?: boolean | null
          created_at?: string | null
          followed?: boolean | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string
          is_private?: boolean | null
          is_verified?: boolean | null
          last_interaction_at?: string | null
          last_updated?: string | null
          messaged?: boolean | null
          notes?: string | null
          outreach_account?: string | null
          posts_count?: number | null
          profile_url?: string | null
          status?: string | null
          username?: string
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          caption: string | null
          comments_count: number | null
          content_type: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          likes_count: number | null
          post_id: string | null
          post_url: string
          posted_at: string | null
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          likes_count?: number | null
          post_id?: string | null
          post_url: string
          posted_at?: string | null
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          likes_count?: number | null
          post_id?: string | null
          post_url?: string
          posted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instagram_posts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "instagram_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          currency: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          payment_method_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date: string
          notes?: string | null
          payment_method_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          payment_method_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_entries: {
        Row: {
          id: string
          level: number
          points: number
          rank: number | null
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          level?: number
          points?: number
          rank?: number | null
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          level?: number
          points?: number
          rank?: number | null
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      login_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_login: string | null
          longest_streak: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_login?: string | null
          longest_streak?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_login?: string | null
          longest_streak?: number | null
          user_id?: string
        }
        Relationships: []
      }
      networking_resources: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          join_url: string | null
          member_count: number | null
          metadata: Json | null
          name: string
          platform: string
          profile_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          join_url?: string | null
          member_count?: number | null
          metadata?: Json | null
          name: string
          platform: string
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          join_url?: string | null
          member_count?: number | null
          metadata?: Json | null
          name?: string
          platform?: string
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      news_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          news_id: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          news_id: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          news_id?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nft_collections: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          points_multiplier: number | null
          tier: string | null
          updated_at: string | null
          weekly_bonus: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          points_multiplier?: number | null
          tier?: string | null
          updated_at?: string | null
          weekly_bonus?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          points_multiplier?: number | null
          tier?: string | null
          updated_at?: string | null
          weekly_bonus?: number | null
        }
        Relationships: []
      }
      onboarding: {
        Row: {
          app_idea: string | null
          created_at: string
          id: string
          name: string | null
          organization: string | null
          social_links: Json | null
          status: string | null
          user_id: string | null
          whatsapp_number: string | null
        }
        Insert: {
          app_idea?: string | null
          created_at?: string
          id?: string
          name?: string | null
          organization?: string | null
          social_links?: Json | null
          status?: string | null
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          app_idea?: string | null
          created_at?: string
          id?: string
          name?: string | null
          organization?: string | null
          social_links?: Json | null
          status?: string | null
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      outreach_accounts: {
        Row: {
          account_type: string | null
          assigned_to: string | null
          created_at: string | null
          credentials: Json | null
          daily_comment_limit: number | null
          daily_dm_limit: number | null
          daily_follow_limit: number | null
          id: string
          industry_focus: string | null
          last_action_at: string | null
          platform: string
          platform_specific_settings: Json | null
          proxy_settings: Json | null
          status: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          account_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          credentials?: Json | null
          daily_comment_limit?: number | null
          daily_dm_limit?: number | null
          daily_follow_limit?: number | null
          id?: string
          industry_focus?: string | null
          last_action_at?: string | null
          platform?: string
          platform_specific_settings?: Json | null
          proxy_settings?: Json | null
          status?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          account_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          credentials?: Json | null
          daily_comment_limit?: number | null
          daily_dm_limit?: number | null
          daily_follow_limit?: number | null
          id?: string
          industry_focus?: string | null
          last_action_at?: string | null
          platform?: string
          platform_specific_settings?: Json | null
          proxy_settings?: Json | null
          status?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      outreach_activities: {
        Row: {
          account_id: string | null
          activity_type: string
          campaign_id: string | null
          content: string | null
          created_at: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          lead_id: string | null
          post_id: string | null
          scheduled_at: string | null
          status: string | null
        }
        Insert: {
          account_id?: string | null
          activity_type: string
          campaign_id?: string | null
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          lead_id?: string | null
          post_id?: string | null
          scheduled_at?: string | null
          status?: string | null
        }
        Update: {
          account_id?: string | null
          activity_type?: string
          campaign_id?: string | null
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          lead_id?: string | null
          post_id?: string | null
          scheduled_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "outreach_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_activities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "outreach_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "instagram_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_activities_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "instagram_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          message_template: string | null
          metrics: Json | null
          name: string
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          message_template?: string | null
          metrics?: Json | null
          name: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          message_template?: string | null
          metrics?: Json | null
          name?: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      plan_comments: {
        Row: {
          author_email: string
          content: string
          created_at: string | null
          id: string
          plan_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_email: string
          content: string
          created_at?: string | null
          id?: string
          plan_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_email?: string
          content?: string
          created_at?: string | null
          id?: string
          plan_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_comments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_phases: {
        Row: {
          created_at: string
          description: string
          id: string
          order_index: number
          plan_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          order_index?: number
          plan_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          order_index?: number
          plan_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_phases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "project_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_subsections: {
        Row: {
          action_steps: string[] | null
          best_practices: string[] | null
          content: string
          created_at: string
          expected_outcomes: string[] | null
          id: string
          order_index: number
          phase_id: string
          title: string
          updated_at: string
        }
        Insert: {
          action_steps?: string[] | null
          best_practices?: string[] | null
          content: string
          created_at?: string
          expected_outcomes?: string[] | null
          id?: string
          order_index?: number
          phase_id: string
          title: string
          updated_at?: string
        }
        Update: {
          action_steps?: string[] | null
          best_practices?: string[] | null
          content?: string
          created_at?: string
          expected_outcomes?: string[] | null
          id?: string
          order_index?: number
          phase_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_subsections_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "plan_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_templates: {
        Row: {
          app_name: string | null
          branding: Json | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          estimated_days: number | null
          features: string[] | null
          id: string
          industry_type: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          app_name?: string | null
          branding?: Json | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_days?: number | null
          features?: string[] | null
          id?: string
          industry_type: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          app_name?: string | null
          branding?: Json | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_days?: number | null
          features?: string[] | null
          id?: string
          industry_type?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      plan_views: {
        Row: {
          id: string
          plan_id: string | null
          user_agent: string | null
          viewed_at: string | null
          viewer_ip: string | null
        }
        Insert: {
          id?: string
          plan_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          viewer_ip?: string | null
        }
        Update: {
          id?: string
          plan_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_views_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          app_name: string | null
          branding: Json | null
          company_name: string | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          estimated_days: number | null
          features: string[] | null
          id: string
          logo: string | null
          status: string | null
          username: string
        }
        Insert: {
          app_name?: string | null
          branding?: Json | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_days?: number | null
          features?: string[] | null
          id?: string
          logo?: string | null
          status?: string | null
          username: string
        }
        Update: {
          app_name?: string | null
          branding?: Json | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_days?: number | null
          features?: string[] | null
          id?: string
          logo?: string | null
          status?: string | null
          username?: string
        }
        Relationships: []
      }
      point_configurations: {
        Row: {
          action: string
          cooldown_minutes: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_daily: number | null
          points_value: number | null
          updated_at: string | null
        }
        Insert: {
          action: string
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_daily?: number | null
          points_value?: number | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_daily?: number | null
          points_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      points_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          points_earned: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      portfolio_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          category_id: string | null
          client_name: string | null
          client_source: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          development_status: string | null
          github_url: string | null
          highlights: string[] | null
          id: string
          image_url: string | null
          invoice_status: string | null
          live_url: string | null
          notion_url: string | null
          project_id: string | null
          project_status: string | null
          technologies: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          client_name?: string | null
          client_source?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          development_status?: string | null
          github_url?: string | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          invoice_status?: string | null
          live_url?: string | null
          notion_url?: string | null
          project_id?: string | null
          project_status?: string | null
          technologies?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          client_name?: string | null
          client_source?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          development_status?: string | null
          github_url?: string | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          invoice_status?: string | null
          live_url?: string | null
          notion_url?: string | null
          project_id?: string | null
          project_status?: string | null
          technologies?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "portfolio_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          created_at: string
          full_name: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          onboarding_completed: boolean | null
          professional_role: string | null
          siso_tokens: number | null
          solana_wallet_address: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          instagram_url?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          professional_role?: string | null
          siso_tokens?: number | null
          solana_wallet_address?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          professional_role?: string | null
          siso_tokens?: number | null
          solana_wallet_address?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      project_documentation: {
        Row: {
          content: string
          created_at: string | null
          id: string
          order_index: number | null
          project_id: string | null
          related_components: string[] | null
          section: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          related_components?: string[] | null
          section: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          related_components?: string[] | null
          section?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documentation_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_features: {
        Row: {
          cost_breakdown: Json | null
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["feature_difficulty"] | null
          estimated_cost: number | null
          id: string
          implementation_plan: string | null
          priority: Database["public"]["Enums"]["feature_priority"] | null
          project_id: string | null
          status: Database["public"]["Enums"]["feature_status"] | null
          timeline_week: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cost_breakdown?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["feature_difficulty"] | null
          estimated_cost?: number | null
          id?: string
          implementation_plan?: string | null
          priority?: Database["public"]["Enums"]["feature_priority"] | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["feature_status"] | null
          timeline_week?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cost_breakdown?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["feature_difficulty"] | null
          estimated_cost?: number | null
          id?: string
          implementation_plan?: string | null
          priority?: Database["public"]["Enums"]["feature_priority"] | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["feature_status"] | null
          timeline_week?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_features_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_plans: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          completion_percentage: number
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_percentage?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_percentage?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_paths: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          level: number
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          level?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          level?: number
          name?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          cooldown_minutes: number | null
          created_at: string
          description: string
          id: string
          level: number
          name: string
          path_id: string
          points: number
          prerequisites: string[]
          requirements: Json
        }
        Insert: {
          cooldown_minutes?: number | null
          created_at?: string
          description: string
          id?: string
          level?: number
          name: string
          path_id: string
          points?: number
          prerequisites?: string[]
          requirements?: Json
        }
        Update: {
          cooldown_minutes?: number | null
          created_at?: string
          description?: string
          id?: string
          level?: number
          name?: string
          path_id?: string
          points?: number
          prerequisites?: string[]
          requirements?: Json
        }
        Relationships: [
          {
            foreignKeyName: "skills_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "skill_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      table_views: {
        Row: {
          columns: Json | null
          created_at: string
          filters: Json | null
          id: string
          name: string
          table_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          columns?: Json | null
          created_at?: string
          filters?: Json | null
          id?: string
          name: string
          table_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          columns?: Json | null
          created_at?: string
          filters?: Json | null
          id?: string
          name?: string
          table_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_rollover_history: {
        Row: {
          created_at: string | null
          id: string
          rolled_from_date: string
          rolled_to_date: string
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rolled_from_date: string
          rolled_to_date: string
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rolled_from_date?: string
          rolled_to_date?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_rollover_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_client_id: string | null
          assigned_to: string | null
          category: Database["public"]["Enums"]["task_category"]
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          duration: number | null
          id: string
          parent_task_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          recurring_days: string[] | null
          recurring_type: string | null
          rolled_over_from: string | null
          start_time: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_client_id?: string | null
          assigned_to?: string | null
          category: Database["public"]["Enums"]["task_category"]
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          duration?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurring_days?: string[] | null
          recurring_type?: string | null
          rolled_over_from?: string | null
          start_time?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_client_id?: string | null
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["task_category"]
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          duration?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurring_days?: string[] | null
          recurring_type?: string | null
          rolled_over_from?: string | null
          start_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_client_id_fkey"
            columns: ["assigned_client_id"]
            isOneToOne: false
            referencedRelation: "client_onboarding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_rolled_over_from_fkey"
            columns: ["rolled_over_from"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          assistant_type: string
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          assistant_type: string
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          assistant_type?: string
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_crypto_history: {
        Row: {
          created_at: string | null
          id: string
          points_exchanged: number
          status: string | null
          tokens_received: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_exchanged: number
          status?: string | null
          tokens_received: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points_exchanged?: number
          status?: string | null
          tokens_received?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_nfts: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          mint_address: string | null
          nft_collections: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mint_address?: string | null
          nft_collections?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mint_address?: string | null
          nft_collections?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_nfts_nft_collections_fkey"
            columns: ["nft_collections"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: []
      }
      user_search_history: {
        Row: {
          created_at: string | null
          id: string
          query: string
          result_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          result_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          result_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_skill_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_completed_at: string | null
          progress: number
          skill_id: string
          times_completed: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_completed_at?: string | null
          progress?: number
          skill_id: string
          times_completed?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_completed_at?: string | null
          progress?: number
          skill_id?: string
          times_completed?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_progress_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          contact_email: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_terms: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_terms?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_terms?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      video_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_bookmarks_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          last_position: number | null
          progress: number | null
          updated_at: string | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position?: number | null
          progress?: number | null
          updated_at?: string | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position?: number | null
          progress?: number | null
          updated_at?: string | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_summaries: {
        Row: {
          created_at: string | null
          difficulty_level: string | null
          id: string
          key_points: string[] | null
          sentiment_score: number | null
          summary: string | null
          topics: string[] | null
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          key_points?: string[] | null
          sentiment_score?: number | null
          summary?: string | null
          topics?: string[] | null
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          key_points?: string[] | null
          sentiment_score?: number | null
          summary?: string | null
          topics?: string[] | null
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_summaries_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_nonces: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          nonce: string
          public_key: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          nonce: string
          public_key: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          nonce?: string
          public_key?: string
          user_id?: string | null
        }
        Relationships: []
      }
      welcome_nft_mints: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          channel_id: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          full_description: string | null
          id: string
          published_at: string | null
          tags: string[] | null
          thumbnailurl: string | null
          title: string
          updated_at: string | null
          url: string
          viewcount: number | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          full_description?: string | null
          id: string
          published_at?: string | null
          tags?: string[] | null
          thumbnailurl?: string | null
          title: string
          updated_at?: string | null
          url: string
          viewcount?: number | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          full_description?: string | null
          id?: string
          published_at?: string | null
          tags?: string[] | null
          thumbnailurl?: string | null
          title?: string
          updated_at?: string | null
          url?: string
          viewcount?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_client_by_user_id: {
        Args: { user_uuid: string }
        Returns: {
          client_id: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_safe: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      feature_difficulty: "low" | "medium" | "high"
      feature_priority: "low" | "medium" | "high"
      feature_status: "pending" | "in_progress" | "completed"
      task_category:
        | "main"
        | "weekly"
        | "daily"
        | "siso_app_dev"
        | "onboarding_app"
        | "instagram"
      task_priority: "low" | "medium" | "high" | "urgent"
      user_role: "admin" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      feature_difficulty: ["low", "medium", "high"],
      feature_priority: ["low", "medium", "high"],
      feature_status: ["pending", "in_progress", "completed"],
      task_category: [
        "main",
        "weekly",
        "daily",
        "siso_app_dev",
        "onboarding_app",
        "instagram",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      user_role: ["admin", "client"],
    },
  },
} as const
