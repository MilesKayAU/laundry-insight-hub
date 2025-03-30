
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Edit, 
  Trash, 
  MoreHorizontal, 
  Search, 
  UserPlus, 
  Mail, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX,
  UserCheck,
  UserX,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  role?: string;
  is_admin?: boolean;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [action, setAction] = useState<'delete' | 'promote' | 'demote' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, get all users from the profiles table (which is accessible to admins through RLS policies)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url');
      
      if (profileError) throw profileError;
      
      // Then fetch user roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (roleError) throw roleError;
      
      // Map roles to users
      const userRoles = new Map();
      roleData?.forEach(role => {
        userRoles.set(role.user_id, role.role);
      });
      
      // Transform profile data into the expected user format
      const enhancedUsers: User[] = profileData.map(profile => ({
        id: profile.id,
        email: profile.username || 'No email',
        created_at: new Date().toISOString(), // Placeholder since we don't have this in profiles
        last_sign_in_at: undefined, // Placeholder since we don't have this in profiles
        user_metadata: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        },
        role: userRoles.get(profile.id) || 'user',
        is_admin: userRoles.get(profile.id) === 'admin'
      }));
      
      setUsers(enhancedUsers || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || "Failed to load users");
      toast({
        title: "Error fetching users",
        description: error.message || "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Instead of directly deleting the auth user (which requires admin rights),
      // we'll simply remove the profile and rely on cascading to handle related data
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Remove from user_roles table as well
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "User deleted",
        description: "User has been successfully removed",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
    setConfirmDialogOpen(false);
  };
  
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Check if user already has a role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      let result;
      
      if (existingRole) {
        // Update existing role
        result = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
      } else {
        // Insert new role
        result = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
      }
      
      if (result.error) throw result.error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, is_admin: newRole === 'admin' } 
          : user
      ));
      
      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}`,
      });
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error updating role",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    }
    setConfirmDialogOpen(false);
  };
  
  const openConfirmDialog = (user: User, actionType: 'delete' | 'promote' | 'demote') => {
    setSelectedUser(user);
    setAction(actionType);
    setConfirmDialogOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage your registered users and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => fetchUsers()}>
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Error fetching users</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={fetchUsers}>Try Again</Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-science-100 text-science-700">
                            {user.user_metadata?.full_name 
                              ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                              : user.email.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {user.user_metadata?.full_name || user.email.split('@')[0]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.is_admin ? "default" : "outline"}
                        className={user.is_admin ? "bg-science-700" : ""}
                      >
                        {user.role || 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openConfirmDialog(user, user.is_admin ? 'demote' : 'promote')}>
                            {user.is_admin ? (
                              <>
                                <ShieldX className="h-4 w-4 mr-2" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Make Admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openConfirmDialog(user, 'delete')}>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {action === 'delete' ? 'Delete User' : 
                 action === 'promote' ? 'Promote to Admin' : 'Remove Admin Status'}
              </DialogTitle>
              <DialogDescription>
                {action === 'delete' 
                  ? 'Are you sure you want to delete this user? This action cannot be undone.'
                  : action === 'promote'
                  ? 'Are you sure you want to give this user admin privileges?'
                  : 'Are you sure you want to remove admin privileges from this user?'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              {selectedUser && (
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-science-100 text-science-700">
                      {selectedUser.user_metadata?.full_name 
                        ? selectedUser.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                        : selectedUser.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedUser.user_metadata?.full_name || selectedUser.email.split('@')[0]}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant={action === 'delete' ? "destructive" : 
                         action === 'promote' ? "default" : "secondary"}
                onClick={() => {
                  if (action === 'delete' && selectedUser) {
                    handleDeleteUser(selectedUser.id);
                  } else if (action === 'promote' && selectedUser) {
                    handleRoleChange(selectedUser.id, 'admin');
                  } else if (action === 'demote' && selectedUser) {
                    handleRoleChange(selectedUser.id, 'user');
                  }
                }}
              >
                {action === 'delete' ? 'Delete' : 
                 action === 'promote' ? 'Promote' : 'Remove Admin'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
