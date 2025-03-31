
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import PaginationControls from "@/components/database/PaginationControls";
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

interface MessageTableProps {
  communications: Communication[];
  loading: boolean;
  openMessageDialog: (comm: Communication) => void;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  filter: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

const MessageTable: React.FC<MessageTableProps> = ({ 
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

export default MessageTable;
