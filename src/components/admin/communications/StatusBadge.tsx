
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
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

export default StatusBadge;
