
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";

// Define interfaces for our RPC function returns to help TypeScript
interface UserMetadataResponse {
  marketing_consent: boolean;
  email: string;
  created_at: string;
}

export const fetchUsers = async (): Promise<User[]> => {
  try {
    console.log("Fetching profiles...");
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url');
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }
    
    console.log("Profiles fetched:", profileData);
    
    const enhancedUsers: User[] = [];
    
    for (const profile of profileData) {
      try {
        // Explicitly type the RPC calls to overcome TypeScript limitations
        const { data, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', profile.id)
          .single()
          .then(async () => {
            // Use a separate function call with explicit typing
            return await supabase.rpc<UserMetadataResponse>('get_user_metadata', { user_id: profile.id });
          });
        
        if (userError) {
          console.error('Error fetching user metadata:', userError);
        }
        
        // Safely access marketing_consent
        const marketingConsent = data?.marketing_consent !== undefined ? Boolean(data.marketing_consent) : false;
        
        // Use explicit typing for the admin check
        const adminCheck = await supabase.rpc<boolean>('has_role', { role: 'admin' });
        const isAdmin = adminCheck.data;
        const adminCheckError = adminCheck.error;
          
        if (adminCheckError) {
          console.log('Error checking admin status for user:', profile.id, adminCheckError);
          enhancedUsers.push({
            id: profile.id,
            email: profile.username || 'No email',
            created_at: new Date().toISOString(),
            user_metadata: {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              marketing_consent: false
            },
            role: 'user',
            is_admin: false
          });
        } else {
          enhancedUsers.push({
            id: profile.id,
            email: profile.username || 'No email',
            created_at: new Date().toISOString(),
            user_metadata: {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              marketing_consent: marketingConsent
            },
            role: isAdmin ? 'admin' : 'user',
            is_admin: !!isAdmin
          });
        }
      } catch (checkError) {
        console.error('Error processing user:', profile.id, checkError);
        enhancedUsers.push({
          id: profile.id,
          email: profile.username || 'No email',
          created_at: new Date().toISOString(),
          user_metadata: {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            marketing_consent: false
          },
          role: 'user',
          is_admin: false
        });
      }
    }
    
    console.log("Enhanced users:", enhancedUsers);
    return enhancedUsers;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
