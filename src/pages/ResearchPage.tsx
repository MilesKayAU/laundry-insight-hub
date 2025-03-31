
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ResearchLink } from '@/lib/researchData';
import { initialResearchLinks } from '@/lib/researchData';
import { useAuth } from '@/contexts/AuthContext';

const ResearchPage: React.FC = () => {
  const [researchLinks, setResearchLinks] = useState<ResearchLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchResearchLinks();
  }, []);

  const fetchResearchLinks = async () => {
    try {
      setLoading(true);
      
      // Fetch research links from Supabase
      const { data, error } = await supabase
        .from('research_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setResearchLinks(data as ResearchLink[]);
      }
    } catch (error: any) {
      console.error('Error fetching research links:', error);
      
      // Fallback to initial data if database query fails
      setResearchLinks(initialResearchLinks as any);
      
      toast({
        title: 'Error loading research',
        description: 'Using local data instead.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">PVA Research</h1>
            <p className="text-muted-foreground mt-2">
              Explore the latest research on Polyvinyl Alcohol (PVA) - its properties, applications, and environmental impact
            </p>
          </div>
          {isAdmin && (
            <Button asChild variant="outline">
              <Link to="/admin">
                <Plus className="mr-2 h-4 w-4" />
                Manage Research Links
              </Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading research data...</p>
          </div>
        ) : researchLinks.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No research links available at this time.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {researchLinks.map((research, index) => (
              <Card key={research.id || index}>
                <CardHeader>
                  <CardTitle>{research.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground mb-4">
                    {research.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm">
                    <a 
                      href={research.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      Read Research
                      <ExternalLink className="h-3.5 w-3.5 ml-2" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchPage;
