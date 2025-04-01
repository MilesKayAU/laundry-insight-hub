
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  ShieldX, 
  ShieldCheck,
  Trash,
  MailCheck,
  MailX
} from "lucide-react";
import { User, formatDate } from './userService';

interface UserListProps {
  users: User[];
  onViewDetails: (user: User) => void;
  onConfirmAction: (user: User, action: 'delete' | 'promote' | 'demote') => void;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  onViewDetails, 
  onConfirmAction 
}) => {
  return (
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
          {users.map((user) => (
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
                    <DropdownMenuItem onClick={() => onConfirmAction(user, user.is_admin ? 'demote' : 'promote')}>
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
                    <DropdownMenuItem onClick={() => onConfirmAction(user, 'delete')}>
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
  );
};

export default UserList;
