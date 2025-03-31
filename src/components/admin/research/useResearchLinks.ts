
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResearchLink, fetchResearchLinks, seedInitialData, syncResearchData } from './utils';

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
      syncResearchData(data);
      
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
      return true;
    } catch (supabaseError) {
      console.error('Error adding to Supabase, using local storage:', supabaseError);
      
      const newLink = {
        id: `local-${Date.now()}`,
        ...link,
        created_at: new Date().toISOString()
      };
      
      const updatedLinks = [newLink, ...researchLinks];
      setResearchLinks(updatedLinks);
      syncResearchData(updatedLinks);
      return true;
    }
  };

  const updateResearchLink = async (id: string, link: Omit<ResearchLink, 'id' | 'created_at'>) => {
    try {
      if (id.startsWith('initial-') || id.startsWith('local-')) {
        const updatedLinks = researchLinks.map(item => 
          item.id === id ? { ...item, ...link } : item
        );
        setResearchLinks(updatedLinks);
        syncResearchData(updatedLinks);
      } else {
        const { error } = await supabase
          .from('research_links')
          .update(link)
          .eq('id', id);

        if (error) throw error;
        
        // Refresh data from server after update
        await loadResearchLinks();
      }
      return true;
    } catch (error) {
      console.error('Error updating research link:', error);
      return false;
    }
  };

  const deleteResearchLink = async (id: string) => {
    try {
      if (id.startsWith('initial-') || id.startsWith('local-')) {
        const updatedLinks = researchLinks.filter(link => link.id !== id);
        setResearchLinks(updatedLinks);
        syncResearchData(updatedLinks);
      } else {
        const { error } = await supabase
          .from('research_links')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting from Supabase:', error);
          throw error;
        }
        
        // Update local state first for immediate UI feedback
        const updatedLinks = researchLinks.filter(link => link.id !== id);
        setResearchLinks(updatedLinks);
        syncResearchData(updatedLinks);
        
        // Then trigger a fresh fetch
        await loadResearchLinks();
      }
      return true;
    } catch (error) {
      console.error('Error deleting research link:', error);
      return false;
    }
  };

  useEffect(() => {
    loadResearchLinks();

    // Listen for custom events from other components
    const handleResearchLinksUpdated = (event: any) => {
      if (event.detail && event.detail.data) {
        setResearchLinks(event.detail.data);
      }
    };
    
    window.addEventListener('research_links_updated', handleResearchLinksUpdated);
    
    return () => {
      window.removeEventListener('research_links_updated', handleResearchLinksUpdated);
    };
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
    deleteResearchLink
  };
};
