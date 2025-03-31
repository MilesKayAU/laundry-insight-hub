
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Book, Plus, RefreshCw } from "lucide-react";
import PaginationControls from "@/components/database/PaginationControls";
import { useResearchLinks } from './research/useResearchLinks';
import ResearchLinkForm from './research/ResearchLinkForm';
import ResearchLinkTable from './research/ResearchLinkTable';
import { ResearchLink } from './research/utils';

const ITEMS_PER_PAGE = 10;

const ResearchManagement = () => {
  const { toast } = useToast();
  const {
    filteredLinks,
    loading,
    currentPage,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    loadResearchLinks,
    addResearchLink,
    updateResearchLink,
    deleteResearchLink
  } = useResearchLinks();

  const [editingLink, setEditingLink] = useState<ResearchLink | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSubmit = async (values: { title: string; description: string; url: string }) => {
    try {
      if (editingLink) {
        // Handle editing
        const success = await updateResearchLink(editingLink.id, values);
        
        if (!success) {
          throw new Error("Failed to update research link");
        }
      } else {
        // Handle adding
        const success = await addResearchLink(values);
        
        if (!success) {
          throw new Error("Failed to add research link");
        }
      }

      setDialogOpen(false);
      setEditingLink(null);
    } catch (error: any) {
      console.error('Error saving research link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save research link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Handling delete for ID:', id);
      const success = await deleteResearchLink(id);
      
      if (!success) {
        throw new Error("Failed to delete research link");
      }
      
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error: any) {
      console.error('Error in handleDelete:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete research link. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Paginate filtered links
  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book className="h-5 w-5 mr-2" />
          Research Management
        </CardTitle>
        <CardDescription>
          Manage research links about Polyvinyl Alcohol (PVA)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="w-full max-w-sm">
            <Input 
              placeholder="Search research links..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 md:mb-0"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadResearchLinks}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => {
                setEditingLink(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Research Link
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading research data...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No research links available. Add your first one!</p>
          </div>
        ) : (
          <>
            <ResearchLinkTable 
              links={paginatedLinks}
              onEdit={(link) => {
                setEditingLink(link);
                setDialogOpen(true);
              }}
              onDelete={handleDelete}
              deleteDialogOpen={deleteDialogOpen}
              deletingId={deletingId}
              setDeleteDialogOpen={setDeleteDialogOpen}
              setDeletingId={setDeletingId}
            />
            
            {filteredLinks.length > ITEMS_PER_PAGE && (
              <div className="mt-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalItems={filteredLinks.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
        
        <ResearchLinkForm 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          editingLink={editingLink}
        />
      </CardContent>
    </Card>
  );
};

export default ResearchManagement;
