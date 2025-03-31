
import { supabase } from "@/integrations/supabase/client";
import { InitialResearchLink, initialResearchLinks } from "@/lib/researchData";

export interface ResearchLink {
  id: string;
  title: string;
  description: string;
  url: string;
  created_at?: string;
}

// Helper function to synchronize data across components
export const syncResearchData = (data: ResearchLink[]) => {
  const storageValue = JSON.stringify(data);
  localStorage.setItem('research_links', storageValue);
  
  // Using a custom event for more reliable cross-component communication
  const customEvent = new CustomEvent('research_links_updated', { 
    detail: { data: data }
  });
  window.dispatchEvent(customEvent);
  
  // Also dispatch the storage event for backward compatibility
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'research_links',
    newValue: storageValue
  }));
};

export const fetchResearchLinks = async () => {
  try {
    const { data, error } = await supabase
      .from('research_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching from Supabase, using initial data:', error);
      const initialData = initialResearchLinks.map((link, index) => ({
        ...link,
        id: `initial-${index}`,
        created_at: new Date().toISOString()
      }));
      
      return { data: initialData, error: null };
    } else if (data && data.length > 0) {
      console.log('Retrieved research links from Supabase:', data);
      return { data, error: null };
    } else {
      const initialData = initialResearchLinks.map((link, index) => ({
        ...link,
        id: `initial-${index}`,
        created_at: new Date().toISOString()
      }));
      
      return { data: initialData, error: null };
    }
  } catch (error: any) {
    console.error('Error fetching research links:', error);
    
    const storedLinks = localStorage.getItem('research_links');
    if (storedLinks) {
      try {
        const parsedLinks = JSON.parse(storedLinks);
        return { data: parsedLinks, error: null };
      } catch (parseError) {
        console.error('Error parsing stored links:', parseError);
        return { data: [], error: parseError };
      }
    } else {
      const initialData = initialResearchLinks.map((link, index) => ({
        ...link,
        id: `initial-${index}`,
        created_at: new Date().toISOString()
      }));
      return { data: initialData, error: null };
    }
  }
};

export const deleteResearchLink = async (id: string) => {
  console.log('Deleting research link with ID:', id);
  
  try {
    // If it's a local ID (starts with 'initial-' or 'local-'), we only need to update local storage
    if (id.startsWith('initial-') || id.startsWith('local-')) {
      console.log('Deleting local research link');
      
      // Get current links from localStorage
      const storedLinks = localStorage.getItem('research_links');
      if (storedLinks) {
        const links = JSON.parse(storedLinks);
        const updatedLinks = links.filter((link: ResearchLink) => link.id !== id);
        
        // Update localStorage
        syncResearchData(updatedLinks);
        return { success: true, error: null };
      }
      
      return { success: false, error: "No local links found" };
    } 
    // If it's a database ID, delete from Supabase
    else {
      console.log('Deleting Supabase research link with ID:', id);
      
      const { error } = await supabase
        .from('research_links')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting from Supabase:', error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    }
  } catch (error) {
    console.error('Error in deleteResearchLink:', error);
    return { success: false, error };
  }
};

export const seedInitialData = async () => {
  try {
    const { data } = await supabase
      .from('research_links')
      .select('id')
      .limit(1);
      
    if (data && data.length === 0) {
      const seedData = initialResearchLinks.map(link => ({
        title: link.title,
        description: link.description,
        url: link.url
      }));
      
      const { error } = await supabase
        .from('research_links')
        .insert(seedData);
        
      if (error) {
        console.error('Error seeding initial data:', error);
        return false;
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking/seeding database:', error);
    return false;
  }
};
