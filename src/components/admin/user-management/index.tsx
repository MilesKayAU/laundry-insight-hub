
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import UserList from './UserList';
import UserControls from './UserControls';
import ConfirmActionDialog from './ConfirmActionDialog';
import { 
  User, 
  fetchUsers, 
  deleteUser, 
  changeUserRole, 
  downloadMarketingEmails 
} from './userService';

const UserManagement: React.FC = () => {
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
    handleFetchUsers();
  }, []);

  const handleFetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await fetchUsers();
      setUsers(userData);
    } catch (error: any) {
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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      toast({
        title: "User deleted",
        description: "User has been successfully removed",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
    setConfirmDialogOpen(false);
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !action) return;
    
    try {
      const newRole = action === 'promote' ? 'admin' : 'user';
      await changeUserRole(selectedUser.id, newRole);
      
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: newRole, is_admin: newRole === 'admin' } 
          : user
      ));
      
      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}`,
      });
    } catch (error: any) {
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
      downloadMarketingEmails(users);
      
      toast({
        title: "Download complete",
        description: `Downloaded marketing email contacts`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download marketing emails",
        variant: "destructive"
      });
    }
  };

  const handleConfirmAction = () => {
    if (!selectedUser || !action) return;
    
    if (action === 'delete') {
      handleDeleteUser();
    } else {
      handleRoleChange();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage your registered users and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserControls 
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          marketingFilter={marketingFilter}
          onMarketingFilterChange={setMarketingFilter}
          onDownloadEmails={handleDownloadMarketingEmails}
          onRefresh={handleFetchUsers}
        />

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
            <Button variant="outline" onClick={handleFetchUsers}>Try Again</Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <UserList
            users={filteredUsers}
            onViewDetails={(user) => setSelectedUser(user)}
            onConfirmAction={openConfirmDialog}
          />
        )}

        <ConfirmActionDialog 
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          selectedUser={selectedUser}
          action={action}
          onConfirm={handleConfirmAction}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagement;
