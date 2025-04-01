
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from './userService';

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  action: 'delete' | 'promote' | 'demote' | null;
  onConfirm: () => void;
}

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  open,
  onOpenChange,
  selectedUser,
  action,
  onConfirm,
}) => {
  const getActionText = () => {
    switch (action) {
      case 'delete':
        return {
          title: 'Delete User',
          description: 'Are you sure you want to delete this user? This action cannot be undone.',
          buttonText: 'Delete',
          variant: 'destructive' as const,
        };
      case 'promote':
        return {
          title: 'Promote to Admin',
          description: 'Are you sure you want to give this user admin privileges?',
          buttonText: 'Promote',
          variant: 'default' as const,
        };
      case 'demote':
        return {
          title: 'Remove Admin Status',
          description: 'Are you sure you want to remove admin privileges from this user?',
          buttonText: 'Remove Admin',
          variant: 'secondary' as const,
        };
      default:
        return {
          title: '',
          description: '',
          buttonText: '',
          variant: 'default' as const,
        };
    }
  };

  const actionText = getActionText();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionText.title}</DialogTitle>
          <DialogDescription>{actionText.description}</DialogDescription>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={actionText.variant} onClick={onConfirm}>
            {actionText.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmActionDialog;
