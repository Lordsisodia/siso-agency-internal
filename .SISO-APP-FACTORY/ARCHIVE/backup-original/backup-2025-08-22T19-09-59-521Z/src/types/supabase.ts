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
      partner_applications: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          expected_referrals: number | null
          experience_level: string | null
          id: string
          name: string
          network_description: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          expected_referrals?: number | null
          experience_level?: string | null
          id?: string
          name: string
          network_description?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          expected_referrals?: number | null
          experience_level?: string | null
          id?: string
          name?: string
          network_description?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          application_id: string | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          status: string | null
          tier: string | null
          total_deals: number | null
          total_earnings: number | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          tier?: string | null
          total_deals?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          tier?: string | null
          total_deals?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      client_leads: {
        Row: {
          business_name: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          estimated_value: number | null
          id: string
          partner_id: string | null
          project_description: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          partner_id?: string | null
          project_description?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          partner_id?: string | null
          project_description?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_leads_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          client_lead_id: string | null
          commission_amount: number
          commission_rate: number | null
          created_at: string | null
          id: string
          paid_at: string | null
          partner_id: string | null
          project_value: number
          status: string | null
        }
        Insert: {
          client_lead_id?: string | null
          commission_amount: number
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          partner_id?: string | null
          project_value: number
          status?: string | null
        }
        Update: {
          client_lead_id?: string | null
          commission_amount?: number
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          partner_id?: string | null
          project_value?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_client_lead_id_fkey"
            columns: ["client_lead_id"]
            isOneToOne: false
            referencedRelation: "client_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      app_plans_partnership: {
        Row: {
          business_name: string
          client_lead_id: string | null
          created_at: string | null
          features: Json | null
          generated_content: string | null
          id: string
          industry: string | null
          investment_range: string | null
          partner_id: string | null
          status: string | null
          timeline_estimate: string | null
          updated_at: string | null
        }
        Insert: {
          business_name: string
          client_lead_id?: string | null
          created_at?: string | null
          features?: Json | null
          generated_content?: string | null
          id?: string
          industry?: string | null
          investment_range?: string | null
          partner_id?: string | null
          status?: string | null
          timeline_estimate?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string
          client_lead_id?: string | null
          created_at?: string | null
          features?: Json | null
          generated_content?: string | null
          id?: string
          industry?: string | null
          investment_range?: string | null
          partner_id?: string | null
          status?: string | null
          timeline_estimate?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_plans_partnership_client_lead_id_fkey"
            columns: ["client_lead_id"]
            isOneToOne: false
            referencedRelation: "client_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_plans_partnership_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {
      calculate_partner_tier: {
        Args: { partner_uuid: string }
        Returns: string
      }
      update_partner_stats: {
        Args: { partner_uuid: string }
        Returns: undefined
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
} 