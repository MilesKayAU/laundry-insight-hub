
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Building, MessageCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Communication {
  id: string;
  sender_email: string;
  company_name: string;
  message: string;
  status: string;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCommunication: Communication | null;
  responseText: string;
  setResponseText: (text: string) => void;
  handleRespond: () => Promise<void>;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

const MessageDialog: React.FC<MessageDialogProps> = ({
  open,
  onOpenChange,
  selectedCommunication,
  responseText,
  setResponseText,
  handleRespond,
  formatDate,
  getStatusBadge
}) => {
  if (!selectedCommunication) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Message from {selectedCommunication.company_name}</DialogTitle>
          <DialogDescription>
            Respond to this inquiry from {selectedCommunication.sender_email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div className="p-4 border rounded-md bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{selectedCommunication.company_name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDate(selectedCommunication.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{selectedCommunication.sender_email}</span>
              <span className="ml-auto">
                {getStatusBadge(selectedCommunication.status)}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm border-t pt-2">
              {selectedCommunication.message}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Your Response
            </h4>
            <Textarea 
              value={responseText} 
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response here..."
              className="min-h-32"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRespond}
            disabled={responseText.trim() === ''}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send Response
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
