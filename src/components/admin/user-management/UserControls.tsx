
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download } from "lucide-react";

interface UserControlsProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  marketingFilter: 'all' | 'consented' | 'not-consented';
  onMarketingFilterChange: (value: 'all' | 'consented' | 'not-consented') => void;
  onDownloadEmails: () => void;
  onRefresh: () => void;
}

const UserControls: React.FC<UserControlsProps> = ({
  searchTerm,
  onSearchTermChange,
  marketingFilter,
  onMarketingFilterChange,
  onDownloadEmails,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
        <Select
          value={marketingFilter}
          onValueChange={(value: any) => onMarketingFilterChange(value)}
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
          onClick={onDownloadEmails}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export Marketing
        </Button>
        <Button size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default UserControls;
