
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
import { Textarea } from "@/components/ui/textarea";
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Mail, 
  Search, 
  Send, 
  MessageSquare, 
  MessageCircle,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  User,
  Building
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PaginationControls from "@/components/database/PaginationControls";

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

const ITEMS_PER_PAGE = 10;

const Communications = () => {
  const { toast } = useToast();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brand_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast({
        title: "Error loading messages",
        description: error.message || "Failed to load communication data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedCommunication) return;
    
    try {
      const { data, error } = await supabase
        .from('brand_messages')
        .update({
          admin_response: responseText,
          status: 'responded',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCommunication.id);
      
      if (error) throw error;
      
      // Update local state
      setCommunications(communications.map(comm => 
        comm.id === selectedCommunication.id
          ? { ...comm, admin_response: responseText, status: 'responded', updated_at: new Date().toISOString() }
          : comm
      ));
      
      toast({
        title: "Response sent",
        description: "Your response has been recorded and will be sent to the sender.",
      });
      
      setMessageDialogOpen(false);
      setResponseText("");
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Error sending response",
        description: error.message || "Failed to send your response",
        variant: "destructive"
      });
    }
  };

  const openMessageDialog = (communication: Communication) => {
    setSelectedCommunication(communication);
    setResponseText(communication.admin_response || "");
    setMessageDialogOpen(true);
  };

  const filteredCommunications = communications.filter(comm =>
    comm.sender_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'responded':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Responded</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communications</CardTitle>
        <CardDescription>
          Manage inquiries and messages from users and brand representatives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                {communications.filter(c => c.status === 'pending').length > 0 && (
                  <Badge className="ml-2 bg-yellow-500">{communications.filter(c => c.status === 'pending').length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="responded">Responded</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={fetchCommunications}
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <MessageTable 
              communications={filteredCommunications}
              loading={loading}
              openMessageDialog={openMessageDialog}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              filter="all"
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </TabsContent>

          <TabsContent value="pending">
            <MessageTable 
              communications={filteredCommunications.filter(c => c.status === 'pending')}
              loading={loading}
              openMessageDialog={openMessageDialog}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              filter="pending"
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </TabsContent>

          <TabsContent value="responded">
            <MessageTable 
              communications={filteredCommunications.filter(c => c.status === 'responded')}
              loading={loading}
              openMessageDialog={openMessageDialog}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              filter="responded"
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </TabsContent>

          <TabsContent value="resolved">
            <MessageTable 
              communications={filteredCommunications.filter(c => c.status === 'resolved')}
              loading={loading}
              openMessageDialog={openMessageDialog}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              filter="resolved"
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </TabsContent>
        </Tabs>

        {/* Message Response Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message from {selectedCommunication?.company_name}</DialogTitle>
              <DialogDescription>
                Respond to this inquiry from {selectedCommunication?.sender_email}
              </DialogDescription>
            </DialogHeader>
            
            {selectedCommunication && (
              <>
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
                  <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
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
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Helper component for message tables
const MessageTable = ({ 
  communications, 
  loading, 
  openMessageDialog, 
  formatDate, 
  getStatusBadge,
  filter,
  currentPage,
  onPageChange,
  itemsPerPage
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }
  
  if (communications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {filter === 'all' 
            ? 'No messages found' 
            : `No ${filter} messages found`}
        </p>
      </div>
    );
  }
  
  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCommunications = communications.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCommunications.map((comm) => (
              <TableRow key={comm.id}>
                <TableCell className="font-medium">{comm.company_name}</TableCell>
                <TableCell>{comm.sender_email}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {comm.message.substring(0, 60)}{comm.message.length > 60 ? '...' : ''}
                </TableCell>
                <TableCell>{formatDate(comm.created_at)}</TableCell>
                <TableCell>{getStatusBadge(comm.status)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openMessageDialog(comm)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {communications.length > itemsPerPage && (
        <PaginationControls
          currentPage={currentPage}
          totalItems={communications.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default Communications;
