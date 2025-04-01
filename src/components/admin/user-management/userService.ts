
import { supabase } from "@/integrations/supabase/client";

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
        const { data: userData, error: userError } = await supabase
          .rpc('get_user_metadata', { user_id: profile.id });
        
        if (userError) {
          console.error('Error fetching user metadata:', userError);
        }
        
        // Safely access marketing_consent with proper type checking
        const marketingConsent = userData && 'marketing_consent' in userData ? Boolean(userData.marketing_consent) : false;
        
        const { data: isAdmin, error: adminCheckError } = await supabase
          .rpc('has_role', { role: 'admin' });
          
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

export const deleteUser = async (userId: string): Promise<void> => {
  console.log("Deleting user:", userId);
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  
  if (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
  
  console.log("Profile deleted, removing from user_roles...");
  const { error: roleError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);
    
  if (roleError) {
    console.error('Error deleting user role:', roleError);
  }
};

export const changeUserRole = async (userId: string, newRole: string): Promise<void> => {
  console.log("Changing role for user:", userId, "to", newRole);
  
  if (newRole === 'admin') {
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing role:', checkError);
      throw checkError;
    }
    
    if (!existingRole) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });
        
      if (insertError) {
        console.error('Error setting admin role:', insertError);
        throw insertError;
      }
    }
  } else {
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
      
    if (deleteError) {
      console.error('Error removing admin role:', deleteError);
      throw deleteError;
    }
  }
};

export const downloadMarketingEmails = (users: User[]): void => {
  try {
    const consentedUsers = users.filter(user => user.user_metadata?.marketing_consent === true);
    
    if (consentedUsers.length === 0) {
      throw new Error("No users have consented to marketing emails");
    }
    
    let csvContent = "Name,Email\n";
    consentedUsers.forEach(user => {
      const name = user.user_metadata?.full_name || '';
      const email = user.email || '';
      csvContent += `"${name}","${email}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'marketing_emails.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading marketing emails:', error);
    throw error;
  }
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
