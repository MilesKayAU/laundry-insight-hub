
// Add type declarations for our custom RPC functions to get user metadata
interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string;
        };
        Insert: {
          id: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
        };
      };
    };
    Functions: {
      has_role: {
        Args: {
          role: string;
        };
        Returns: boolean;
      };
    };
  };
}
