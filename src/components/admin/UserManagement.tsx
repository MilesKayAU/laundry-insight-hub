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
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Edit, 
  Trash, 
  MoreHorizontal, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX,
  AlertCircle,
  MailCheck,
  MailX,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
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
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [action, setAction] = useState<'delete' | 'promote' | 'demote' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marketingFilter, setMarketingFilter] = useState<'all' | 'consented' | 'not-consented'>('all');
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
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
            .rpc('get_user_metadata', { 
              user_id: profile.id 
            });
          
          if (userError) {
            console.error('Error fetching user metadata:', userError);
          }
          
          const marketingConsent = userData ? userData.marketing_consent || false : false;
          
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
              is_admin: isAdmin
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
      setUsers(enhancedUsers);
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
  
  const handleDownloadMarketingEmails = () => {
    try {
      const consentedUsers = users.filter(user => user.user_metadata?.marketing_consent === true);
      
      if (consentedUsers.length === 0) {
        toast({
          title: "No marketing emails",
          description: "No users have consented to marketing emails",
          variant: "warning"
        });
        return;
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
      
      toast({
        title: "Download complete",
        description: `Downloaded ${consentedUsers.length} marketing email contacts`,
      });
    } catch (error: any) {
      console.error('Error downloading marketing emails:', error);
      toast({
        title: "Download failed",
        description: error.message || "Failed to download marketing emails",
        variant: "destructive"
      });
    }
  };
  
  const openConfirmDialog = (user: User, actionType: 'delete' | 'promote' | 'demote') => {
    setSelectedUser(user);
    setAction(actionType);
    setConfirmDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (marketingFilter === 'all') {
      return matchesSearch;
    } else if (marketingFilter === 'consented') {
      return matchesSearch && user.user_metadata?.marketing_consent === true;
    } else {
      return matchesSearch && user.user_metadata?.marketing_consent !== true;
    }
  });

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Select
              value={marketingFilter}
              onValueChange={(value: any) => setMarketingFilter(value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by consent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="consented">Marketing Consented</SelectItem>
                <SelectItem value="not-consented">No Marketing Consent</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleDownloadMarketingEmails}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Marketing
            </Button>
            <Button size="sm" onClick={fetchUsers}>
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
                  <TableHead>Marketing</TableHead>
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
                    <TableCell>
                      {user.user_metadata?.marketing_consent ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                          <MailCheck className="h-3 w-3" />
                          Subscribed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
                          <MailX className="h-3 w-3" />
                          Not subscribed
                        </Badge>
                      )}
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
