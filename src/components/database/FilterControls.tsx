
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, SearchIcon, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  filterPvaStatus: string;
  setFilterPvaStatus: (value: string) => void;
  productTypes: string[];
  setCurrentPage: (page: number) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterPvaStatus,
  setFilterPvaStatus,
  productTypes,
  setCurrentPage,
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product or brand name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-3">
          <Select 
            value={filterType} 
            onValueChange={(value) => {
              setFilterType(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Product Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {productTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                PVA Filter
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by PVA</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterPvaStatus === "all"}
                onCheckedChange={() => {
                  setFilterPvaStatus("all");
                  setCurrentPage(1);
                }}
              >
                All Products
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterPvaStatus === "contains"}
                onCheckedChange={() => {
                  setFilterPvaStatus("contains");
                  setCurrentPage(1);
                }}
              >
                Contains PVA
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterPvaStatus === "free"}
                onCheckedChange={() => {
                  setFilterPvaStatus("free");
                  setCurrentPage(1);
                }}
              >
                PVA-Free
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterPvaStatus === "unknown"}
                onCheckedChange={() => {
                  setFilterPvaStatus("unknown");
                  setCurrentPage(1);
                }}
              >
                Unknown PVA
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
