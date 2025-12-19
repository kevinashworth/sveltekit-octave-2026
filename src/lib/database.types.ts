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
      addresses: {
        Row: {
          address_type: string | null
          city: string
          created_at: string | null
          id: number
          location: string | null
          state: string
          street1: string | null
          street2: string | null
          zip: string | null
        }
        Insert: {
          address_type?: string | null
          city: string
          created_at?: string | null
          id?: number
          location?: string | null
          state: string
          street1?: string | null
          street2?: string | null
          zip?: string | null
        }
        Update: {
          address_type?: string | null
          city?: string
          created_at?: string | null
          id?: number
          location?: string | null
          state?: string
          street1?: string | null
          street2?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          collection_name: string
          created_at: string
          html_body: string | null
          id: string
          object_id: string
          parent_comment_id: string | null
          posted_at: string | null
          top_level_comment_id: string | null
          user_id: string
        }
        Insert: {
          body: string
          collection_name: string
          created_at: string
          html_body?: string | null
          id: string
          object_id: string
          parent_comment_id?: string | null
          posted_at?: string | null
          top_level_comment_id?: string | null
          user_id: string
        }
        Update: {
          body?: string
          collection_name?: string
          created_at?: string
          html_body?: string | null
          id?: string
          object_id?: string
          parent_comment_id?: string | null
          posted_at?: string | null
          top_level_comment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_top_level_comment_id_fkey"
            columns: ["top_level_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_addresses: {
        Row: {
          address_id: number
          contact_id: string
          id: number
        }
        Insert: {
          address_id: number
          contact_id: string
          id?: number
        }
        Update: {
          address_id?: number
          contact_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "contact_addresses_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_addresses_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_links: {
        Row: {
          contact_id: string
          id: number
          link_id: number
        }
        Insert: {
          contact_id: string
          id?: number
          link_id: number
        }
        Update: {
          contact_id?: string
          id?: number
          link_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "contact_links_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_links_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_past_projects: {
        Row: {
          contact_id: string
          id: number
          project_id: string
          title_for_project: string | null
        }
        Insert: {
          contact_id: string
          id?: number
          project_id: string
          title_for_project?: string | null
        }
        Update: {
          contact_id?: string
          id?: number
          project_id?: string
          title_for_project?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_past_projects_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_past_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "past_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_projects: {
        Row: {
          contact_id: string
          id: number
          project_id: string
          title_for_project: string | null
        }
        Insert: {
          contact_id: string
          id?: number
          project_id: string
          title_for_project?: string | null
        }
        Update: {
          contact_id?: string
          id?: number
          project_id?: string
          title_for_project?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_projects_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address_string: string | null
          body: string | null
          created_at: string
          display_name: string
          first_name: string | null
          gender: string | null
          html_body: string | null
          id: string
          last_name: string | null
          slug: string
          the_address: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_string?: string | null
          body?: string | null
          created_at: string
          display_name: string
          first_name?: string | null
          gender?: string | null
          html_body?: string | null
          id: string
          last_name?: string | null
          slug: string
          the_address?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_string?: string | null
          body?: string | null
          created_at?: string
          display_name?: string
          first_name?: string | null
          gender?: string | null
          html_body?: string | null
          id?: string
          last_name?: string | null
          slug?: string
          the_address?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          created_at: string | null
          id: number
          platform_name: string
          profile_link: string
          profile_name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          platform_name: string
          profile_link: string
          profile_name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          platform_name?: string
          profile_link?: string
          profile_name?: string
        }
        Relationships: []
      }
      office_addresses: {
        Row: {
          address_id: number
          id: number
          office_id: string
        }
        Insert: {
          address_id: number
          id?: number
          office_id: string
        }
        Update: {
          address_id?: number
          id?: number
          office_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_addresses_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "office_addresses_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      office_contacts: {
        Row: {
          contact_id: string
          id: number
          office_id: string
        }
        Insert: {
          contact_id: string
          id?: number
          office_id: string
        }
        Update: {
          contact_id?: string
          id?: number
          office_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "office_contacts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      office_links: {
        Row: {
          id: number
          link_id: number
          office_id: string
        }
        Insert: {
          id?: number
          link_id: number
          office_id: string
        }
        Update: {
          id?: number
          link_id?: number
          office_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_links_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "office_links_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      office_past_projects: {
        Row: {
          id: number
          office_id: string
          project_id: string
        }
        Insert: {
          id?: number
          office_id: string
          project_id: string
        }
        Update: {
          id?: number
          office_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_past_projects_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "office_past_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "past_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      office_phones: {
        Row: {
          country_code: string | null
          id: number
          national_format: string | null
          office_id: string
          phone_number: string | null
          phone_number_as_input: string | null
          phone_number_type: string | null
        }
        Insert: {
          country_code?: string | null
          id?: number
          national_format?: string | null
          office_id: string
          phone_number?: string | null
          phone_number_as_input?: string | null
          phone_number_type?: string | null
        }
        Update: {
          country_code?: string | null
          id?: number
          national_format?: string | null
          office_id?: string
          phone_number?: string | null
          phone_number_as_input?: string | null
          phone_number_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "office_phones_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      office_projects: {
        Row: {
          id: number
          office_id: string
          project_id: string
        }
        Insert: {
          id?: number
          office_id: string
          project_id: string
        }
        Update: {
          id?: number
          office_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_projects_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "office_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          body: string | null
          created_at: string
          display_name: string
          html_body: string | null
          id: string
          slug: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at: string
          display_name: string
          html_body?: string | null
          id: string
          slug: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          display_name?: string
          html_body?: string | null
          id?: string
          slug?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      past_project_links: {
        Row: {
          id: number
          link_id: number
          project_id: string
        }
        Insert: {
          id?: number
          link_id: number
          project_id: string
        }
        Update: {
          id?: number
          link_id?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "past_project_links_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "past_project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "past_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      past_projects: {
        Row: {
          casting_company: string | null
          created_at: string
          html_notes: string | null
          html_summary: string | null
          id: string
          network: string | null
          notes: string | null
          order: string | null
          platform_type: string | null
          project_title: string
          project_type: string | null
          renewed: boolean | null
          season: string | null
          shooting_location: string | null
          slug: string
          sort_title: string | null
          status: string | null
          summary: string | null
          union: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          casting_company?: string | null
          created_at: string
          html_notes?: string | null
          html_summary?: string | null
          id: string
          network?: string | null
          notes?: string | null
          order?: string | null
          platform_type?: string | null
          project_title: string
          project_type?: string | null
          renewed?: boolean | null
          season?: string | null
          shooting_location?: string | null
          slug: string
          sort_title?: string | null
          status?: string | null
          summary?: string | null
          union?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          casting_company?: string | null
          created_at?: string
          html_notes?: string | null
          html_summary?: string | null
          id?: string
          network?: string | null
          notes?: string | null
          order?: string | null
          platform_type?: string | null
          project_title?: string
          project_type?: string | null
          renewed?: boolean | null
          season?: string | null
          shooting_location?: string | null
          slug?: string
          sort_title?: string | null
          status?: string | null
          summary?: string | null
          union?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "past_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_links: {
        Row: {
          id: number
          link_id: number
          project_id: string
        }
        Insert: {
          id?: number
          link_id: number
          project_id: string
        }
        Update: {
          id?: number
          link_id?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_links_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          casting_company: string | null
          created_at: string
          html_notes: string | null
          html_summary: string | null
          id: string
          network: string | null
          notes: string | null
          order: string | null
          platform_type: string | null
          project_title: string
          project_type: string | null
          renewed: boolean | null
          season: string | null
          shooting_location: string | null
          slug: string
          sort_title: string | null
          status: string | null
          summary: string | null
          union: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          casting_company?: string | null
          created_at: string
          html_notes?: string | null
          html_summary?: string | null
          id: string
          network?: string | null
          notes?: string | null
          order?: string | null
          platform_type?: string | null
          project_title: string
          project_type?: string | null
          renewed?: boolean | null
          season?: string | null
          shooting_location?: string | null
          slug: string
          sort_title?: string | null
          status?: string | null
          summary?: string | null
          union?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          casting_company?: string | null
          created_at?: string
          html_notes?: string | null
          html_summary?: string | null
          id?: string
          network?: string | null
          notes?: string | null
          order?: string | null
          platform_type?: string | null
          project_title?: string
          project_type?: string | null
          renewed?: boolean | null
          season?: string | null
          shooting_location?: string | null
          slug?: string
          sort_title?: string | null
          status?: string | null
          summary?: string | null
          union?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      statistics: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
        }
        Relationships: []
      }
      user_emails: {
        Row: {
          address: string
          id: number
          is_primary: boolean | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          address: string
          id?: number
          is_primary?: boolean | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          address?: string
          id?: number
          is_primary?: boolean | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          group_name: string
          id: number
          user_id: string
        }
        Insert: {
          group_name: string
          id?: number
          user_id: string
        }
        Update: {
          group_name?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          id: number
          notifications_comments: boolean | null
          notifications_posts: boolean | null
          notifications_replies: boolean | null
          notifications_users: boolean | null
          user_id: string
        }
        Insert: {
          id?: number
          notifications_comments?: boolean | null
          notifications_posts?: boolean | null
          notifications_replies?: boolean | null
          notifications_users?: boolean | null
          user_id: string
        }
        Update: {
          id?: number
          notifications_comments?: boolean | null
          notifications_posts?: boolean | null
          notifications_replies?: boolean | null
          notifications_users?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_methods: Json | null
          bio: string | null
          created_at: string
          display_name: string
          email: string | null
          email_hash: string | null
          html_bio: string | null
          id: string
          is_admin: boolean | null
          locale: string | null
          slug: string
          twitter_username: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          auth_methods?: Json | null
          bio?: string | null
          created_at: string
          display_name: string
          email?: string | null
          email_hash?: string | null
          html_bio?: string | null
          id: string
          is_admin?: boolean | null
          locale?: string | null
          slug: string
          twitter_username?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          auth_methods?: Json | null
          bio?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          email_hash?: string | null
          html_bio?: string | null
          id?: string
          is_admin?: boolean | null
          locale?: string | null
          slug?: string
          twitter_username?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
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
