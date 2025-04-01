
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";

interface UserMetadata {
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
        // Cast the response to include the correct return type
        const { data: userData, error: userError } = await supabase
          .rpc('get_user_metadata', { user_id: profile.id }) as unknown as { 
            data: UserMetadata | null; 
            error: any; 
          };
        
        if (userError) {
          console.error('Error fetching user metadata:', userError);
        }
        
        // Safely access marketing_consent with proper type checking
        const marketingConsent = userData && 'marketing_consent' in userData 
          ? Boolean(userData.marketing_consent) 
          : false;
        
        // Cast the response to include the correct return type for boolean
        const { data: isAdmin, error: adminCheckError } = await supabase
          .rpc('has_role', { role: 'admin' }) as unknown as {
            data: boolean | null;
            error: any;
          };
          
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
