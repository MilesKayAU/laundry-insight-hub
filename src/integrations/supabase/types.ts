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
      [_ in never]: never
    }
    Functions: {
      extract_youtube_id: {
        Args: {
          youtube_url: string
        }
        Returns: string
      }
      force_delete_product: {
        Args: {
          product_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          role: string
        }
        Returns: boolean
      }
      is_primary_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
