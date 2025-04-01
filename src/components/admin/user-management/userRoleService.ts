
import { supabase } from "@/integrations/supabase/client";

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
