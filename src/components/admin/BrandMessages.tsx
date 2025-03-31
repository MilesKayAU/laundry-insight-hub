import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BrandMessage {
  id: string;
  brand_id: string;
  sender_email: string;
  company_name: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

interface BrandProfile {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  contact_email: string | null;
  verified: boolean;
}

export interface BrandMessagesProps {
  messages: BrandMessage[];
  profiles: BrandProfile[];
  selectedMessage: BrandMessage | null;
  messageResponse: string;
  onMessageSelect?: (message: BrandMessage) => void;
  onChangeResponse: (response: string) => void;
  onSendResponse: () => void;
  onDeleteMessage: (id: string) => void;
  onCloseMessageDetails: () => void;
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
}

const BrandMessages: React.FC<BrandMessagesProps> = ({
  messages,
  profiles,
  selectedMessage,
  messageResponse,
  onChangeResponse,
  onSendResponse,
  onDeleteMessage,
  onCloseMessageDetails,
  onMessageSelect,
  dialogOpen = false,
  onDialogOpenChange = () => {}
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Brand Messages</CardTitle>
          <CardDescription>
            Review and respond to messages from brand representatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">
                        {profiles.find(b => b.id === message.brand_id)?.name || "Unknown Brand"}
                      </TableCell>
                      <TableCell>{message.company_name}</TableCell>
                      <TableCell>{message.sender_email}</TableCell>
                      <TableCell>
                        {new Date(message.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {message.admin_response ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">Responded</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onMessageSelect(message)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          title="View & Respond"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No brand messages received
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Brand Message</DialogTitle>
            <DialogDescription>
              Review and respond to the brand representative
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-sm font-semibold">Brand</p>
                    <p className="text-sm">
                      {profiles.find(b => b.id === selectedMessage.brand_id)?.name || "Unknown Brand"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Company</p>
                    <p className="text-sm">{selectedMessage.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Email</p>
                    <p className="text-sm">{selectedMessage.sender_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Date</p>
                    <p className="text-sm">{new Date(selectedMessage.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">Message</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  placeholder="Type your response to the brand representative..."
                  rows={6}
                  value={messageResponse}
                  onChange={(e) => onChangeResponse(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This response will be stored and can be emailed to the brand contact.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="submit"
              onClick={onSendResponse}
              disabled={!messageResponse?.trim()}
            >
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BrandMessages;
