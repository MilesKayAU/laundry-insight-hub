
export type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    marketing_consent?: boolean;
  };
  role?: string;
  is_admin?: boolean;
};
