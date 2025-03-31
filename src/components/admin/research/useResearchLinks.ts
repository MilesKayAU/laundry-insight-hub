
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResearchLink, fetchResearchLinks, seedInitialData, syncResearchData, deleteResearchLink } from './utils';

export const useResearchLinks = () => {
  const { toast } = useToast();
  const [researchLinks, setResearchLinks] = useState<ResearchLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoized fetch function to avoid recreation on renders
  const loadResearchLinks = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await fetchResearchLinks();
      
      if (error) {
        throw error;
      }
      
      setResearchLinks(data);
      
      // Try to seed database if needed
      try {
        await seedInitialData();
      } catch (seedError) {
        console.error('Error seeding database:', seedError);
      }
    } catch (error: any) {
      console.error('Error loading research links:', error);
      toast({
        title: "Error",
        description: "Failed to load research data. Using local data instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addResearchLink = async (link: Omit<ResearchLink, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('research_links')
        .insert([link])
        .select();

      if (error) throw error;
      
      // Refresh data from server after addition
      await loadResearchLinks();
      
      toast({
        title: "Success",
        description: "Research link successfully added",
      });
      
      return true;
    } catch (error) {
      console.error('Error adding to Supabase:', error);
      
      toast({
        title: "Error",
        description: "Failed to add research link",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const updateResearchLink = async (id: string, link: Omit<ResearchLink, 'id' | 'created_at'>) => {
    try {
      // For local links (starting with 'initial-' or 'local-'), update in local state
      if (id.startsWith('initial-') || id.startsWith('local-')) {
        const updatedLinks = researchLinks.map(item => 
          item.id === id ? { ...item, ...link } : item
        );
        setResearchLinks(updatedLinks);
        syncResearchData(updatedLinks);
        
        toast({
          title: "Success",
          description: "Research link successfully updated",
        });
        
        return true;
      } 
      // For Supabase links, update in database
      else {
        const { error } = await supabase
          .from('research_links')
          .update(link)
          .eq('id', id);

        if (error) throw error;
        
        // Refresh data from server after update
        await loadResearchLinks();
        
        toast({
          title: "Success",
          description: "Research link successfully updated",
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error updating research link:', error);
      
      toast({
        title: "Error",
        description: "Failed to update research link",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const handleDeleteResearchLink = async (id: string) => {
    try {
      console.log('Executing deleteResearchLink for ID:', id);
      
      // Update state immediately for better UX
      const updatedLinks = researchLinks.filter(link => link.id !== id);
      setResearchLinks(updatedLinks);
      
      // Attempt deletion from database or localStorage
      const { success, error } = await deleteResearchLink(id);
      
      if (!success) {
        // If deletion failed, revert the state update
        console.error('Deletion failed, reverting state update:', error);
        await loadResearchLinks(); // Reload the original data
        
        toast({
          title: "Error",
          description: "Failed to delete research link: " + (error?.message || "Unknown error"),
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Research link successfully deleted",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error in handleDeleteResearchLink:', error);
      
      // Reload the original data
      await loadResearchLinks();
      
      toast({
        title: "Error",
        description: "Failed to delete research link: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
      
      return false;
    }
  };

  useEffect(() => {
    loadResearchLinks();
  }, [loadResearchLinks]);

  // Filter links by search term
  const filteredLinks = researchLinks.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    link.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    researchLinks,
    filteredLinks,
    loading,
    currentPage,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    loadResearchLinks,
    addResearchLink,
    updateResearchLink,
    deleteResearchLink: handleDeleteResearchLink
  };
};
