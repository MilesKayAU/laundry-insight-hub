
import React, { useState, useEffect } from 'react';
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Search, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import MessageTable from "./communications/MessageTable";
import MessageDialog from "./communications/MessageDialog";
import StatusBadge from "./communications/StatusBadge";
import { formatDate } from "./communications/utils";

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

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
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

        <MessageDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          selectedCommunication={selectedCommunication}
          responseText={responseText}
          setResponseText={setResponseText}
          handleRespond={handleRespond}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
        />
      </CardContent>
    </Card>
  );
};

export default Communications;
