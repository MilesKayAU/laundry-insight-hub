
import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Book, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ResearchLink {
  id: string;
  title: string;
  description: string;
  url: string;
  created_at: string;
}

const ResearchPage = () => {
  const [researchLinks, setResearchLinks] = useState<ResearchLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchResearchLinks();

    // Listen for localStorage changes made from other tabs/components
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events for more reliable updates
    window.addEventListener('research_links_updated', handleResearchLinksUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('research_links_updated', handleResearchLinksUpdated);
    };
  }, []);

  // Handle custom event updates
  const handleResearchLinksUpdated = (event: any) => {
    if (event.detail && event.detail.data) {
      console.log('Research page received updated links via custom event', event.detail.data);
      setResearchLinks(event.detail.data);
    }
  };

  // Handle changes in localStorage made by other components
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'research_links' && e.newValue) {
      try {
        console.log('Research page received updated links via storage event');
        const updatedLinks = JSON.parse(e.newValue);
        setResearchLinks(updatedLinks);
      } catch (error) {
        console.error('Error parsing research links from storage event:', error);
      }
    }
  };

  const fetchResearchLinks = async () => {
    try {
      console.log('Research page fetching links');
      setLoading(true);
      // Always fetch fresh data from Supabase
      const { data, error } = await supabase
        .from('research_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // If data exists in Supabase, use it
      if (data && data.length > 0) {
        console.log('Research page setting links from Supabase');
        setResearchLinks(data);
        
        // Update localStorage for consistency
        localStorage.setItem('research_links', JSON.stringify(data));
      } else {
        // Try to use data from localStorage if no Supabase data
        const storedLinks = localStorage.getItem('research_links');
        if (storedLinks) {
          try {
            console.log('Research page setting links from localStorage');
            const parsedLinks = JSON.parse(storedLinks);
            setResearchLinks(parsedLinks);
          } catch (parseError) {
            console.error('Error parsing stored links:', parseError);
            setResearchLinks([]);
          }
        } else {
          setResearchLinks([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching research links:', error);
      
      // Try to get data from localStorage if Supabase query fails
      const storedLinks = localStorage.getItem('research_links');
      if (storedLinks) {
        try {
          const parsedLinks = JSON.parse(storedLinks);
          setResearchLinks(parsedLinks);
        } catch (e) {
          console.error('Error parsing localStorage data:', e);
          setResearchLinks([]);
        }
      }
      
      toast({
        title: "Error",
        description: "Failed to load research data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Force refresh less often but make it a manual option too
  useEffect(() => {
    const refreshInterval = setInterval(fetchResearchLinks, 300000); // Refresh every 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold">PVA Research</h1>
          <p className="text-muted-foreground mt-2">
            Latest research on Polyvinyl Alcohol (PVA), its applications, and environmental impacts
          </p>
        </div>
        
        <div className="flex gap-2">
          {isAdmin && (
            <Button asChild>
              <Link to="/admin">
                <Book className="h-4 w-4 mr-2" />
                Manage Research Links
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={fetchResearchLinks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About PVA Research</CardTitle>
          <CardDescription>
            Scientific studies and findings about Polyvinyl Alcohol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page collects and presents the latest scientific research about Polyvinyl Alcohol (PVA), 
            including its environmental impact, toxicity, biodegradability, and usage in consumer products. 
            The research presented here aims to provide evidence-based information to help consumers make 
            informed decisions about products containing PVA.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading research data...</p>
          </div>
        ) : researchLinks.length > 0 ? (
          researchLinks.map((research) => (
            <Card key={research.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">{research.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{research.description}</p>
                <div className="flex justify-end">
                  <Button variant="outline" asChild>
                    <a 
                      href={research.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Research
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No research links available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchPage;
