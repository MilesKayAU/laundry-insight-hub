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
      amazon_products: {
        Row: {
          asin: string
          brand: string | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          image_urls: Json | null
          local_product_id: string | null
          price: number | null
          product_url: string | null
          specifications: Json | null
          status: string | null
          sync_status: string | null
          synced_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          asin: string
          brand?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          image_urls?: Json | null
          local_product_id?: string | null
          price?: number | null
          product_url?: string | null
          specifications?: Json | null
          status?: string | null
          sync_status?: string | null
          synced_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          asin?: string
          brand?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          image_urls?: Json | null
          local_product_id?: string | null
          price?: number | null
          product_url?: string | null
          specifications?: Json | null
          status?: string | null
          sync_status?: string | null
          synced_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      amazon_sync_logs: {
        Row: {
          created_by: string | null
          details: string | null
          end_time: string | null
          errors: Json | null
          id: string
          products_synced: number | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          created_by?: string | null
          details?: string | null
          end_time?: string | null
          errors?: Json | null
          id?: string
          products_synced?: number | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          created_by?: string | null
          details?: string | null
          end_time?: string | null
          errors?: Json | null
          id?: string
          products_synced?: number | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brand_messages: {
        Row: {
          admin_response: string | null
          brand_id: string
          company_name: string
          created_at: string | null
          id: string
          message: string
          sender_email: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_response?: string | null
          brand_id: string
          company_name: string
          created_at?: string | null
          id?: string
          message: string
          sender_email: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_response?: string | null
          brand_id?: string
          company_name?: string
          created_at?: string | null
          id?: string
          message?: string
          sender_email?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_messages_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          contact_email: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      distributor_inquiries: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          region: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          region?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          region?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          brand_name: string
          created_at: string | null
          id: string
          image_url: string
          product_id: string
          status: string | null
          uploaded_by: string | null
        }
        Insert: {
          brand_name: string
          created_at?: string | null
          id?: string
          image_url: string
          product_id: string
          status?: string | null
          uploaded_by?: string | null
        }
        Update: {
          brand_name?: string
          created_at?: string | null
          id?: string
          image_url?: string
          product_id?: string
          status?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      product_submissions: {
        Row: {
          approved: boolean | null
          brand: string
          country: string | null
          createdat: string | null
          description: string | null
          id: string
          imageurl: string | null
          ingredients: string | null
          name: string
          owner_id: string | null
          pvapercentage: number | null
          pvastatus: string | null
          type: string
          updatedat: string | null
          videourl: string | null
          websiteurl: string | null
        }
        Insert: {
          approved?: boolean | null
          brand: string
          country?: string | null
          createdat?: string | null
          description?: string | null
          id?: string
          imageurl?: string | null
          ingredients?: string | null
          name: string
          owner_id?: string | null
          pvapercentage?: number | null
          pvastatus?: string | null
          type: string
          updatedat?: string | null
          videourl?: string | null
          websiteurl?: string | null
        }
        Update: {
          approved?: boolean | null
          brand?: string
          country?: string | null
          createdat?: string | null
          description?: string | null
          id?: string
          imageurl?: string | null
          ingredients?: string | null
          name?: string
          owner_id?: string | null
          pvapercentage?: number | null
          pvastatus?: string | null
          type?: string
          updatedat?: string | null
          videourl?: string | null
          websiteurl?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      research_links: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      video_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          youtube_id: string
          youtube_url: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "video_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      amazon_product_mapping: {
        Row: {
          amazon_id: string | null
          amazon_images: Json | null
          amazon_title: string | null
          asin: string | null
          local_description: string | null
          local_id: string | null
          local_title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      extract_youtube_id: {
        Args: { youtube_url: string }
        Returns: string
      }
      force_delete_product: {
        Args: { product_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { role: string }
        Returns: boolean
      }
      is_primary_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      now: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
