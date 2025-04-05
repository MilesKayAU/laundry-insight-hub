
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Youtube } from "lucide-react";

interface VideoCategory {
  id: string;
  name: string;
  description: string | null;
}

interface Video {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url: string | null;
}

const VideosPage = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching videos and categories data...");
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('video_categories')
          .select('id, name, description')
          .order('name');
        
        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          throw categoriesError;
        }
        
        // Fetch videos
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('id, category_id, title, description, youtube_url, youtube_id, thumbnail_url')
          .order('title');
        
        if (videosError) {
          console.error("Error fetching videos:", videosError);
          throw videosError;
        }
        
        console.log("Fetched categories:", categoriesData);
        console.log("Fetched videos:", videosData);
        setCategories(categoriesData || []);
        setVideos(videosData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load videos',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group videos by category
  const videosByCategory = categories.map(category => ({
    category,
    videos: videos.filter(video => video.category_id === category.id)
  })).filter(group => group.videos.length > 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Videos</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Educational videos about PVA and related topics to help you understand the science behind the products.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p>Loading videos...</p>
        </div>
      ) : videosByCategory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl">No videos available yet.</p>
        </div>
      ) : (
        <div className="space-y-12 pb-12">
          {videosByCategory.map(({ category, videos }) => (
            <section key={category.id} className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-muted pb-2">{category.name}</h2>
              {category.description && (
                <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{category.description}</p>
              )}
              
              {selectedVideo && selectedVideo.category_id === category.id ? (
                <div className="mb-8">
                  <div className="aspect-video w-full max-w-3xl mx-auto mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}`}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg shadow-lg"
                    ></iframe>
                  </div>
                  <div className="text-center max-w-3xl mx-auto">
                    <h3 className="text-xl font-semibold mb-2">{selectedVideo.title}</h3>
                    {selectedVideo.description && (
                      <p className="text-muted-foreground whitespace-pre-wrap">{selectedVideo.description}</p>
                    )}
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSelectedVideo(null)}
                    >
                      Back to Videos
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map(video => (
                    <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div 
                        className="cursor-pointer" 
                        onClick={() => setSelectedVideo(video)}
                      >
                        <div className="relative aspect-video">
                          {video.thumbnail_url ? (
                            <img 
                              src={video.thumbnail_url} 
                              alt={video.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Youtube className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-red-600 text-white p-3 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{video.description}</p>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideosPage;
