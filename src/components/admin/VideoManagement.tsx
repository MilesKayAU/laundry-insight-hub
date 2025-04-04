import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Youtube } from "lucide-react";

interface VideoCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface Video {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

const VideoManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  
  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editCategory, setEditCategory] = useState<VideoCategory | null>(null);
  const [newVideo, setNewVideo] = useState({ 
    title: '', 
    description: '', 
    youtube_url: '', 
    category_id: '' 
  });
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  
  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editVideoDialogOpen, setEditVideoDialogOpen] = useState(false);

  // Fetch categories and videos
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('video_categories')
        .select('*')
        .order('name');
      
      if (categoriesError) throw categoriesError;
      
      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('title');
      
      if (videosError) throw videosError;
      
      setCategories(categoriesData);
      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load videos and categories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  // Category CRUD operations
  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Category name is required',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('video_categories')
        .insert([{ 
          name: newCategory.name.trim(), 
          description: newCategory.description.trim() || null 
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
      
      setCategoryDialogOpen(false);
      setNewCategory({ name: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category',
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateCategory = async () => {
    try {
      if (!editCategory || !editCategory.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Category name is required',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('video_categories')
        .update({
          name: editCategory.name.trim(),
          description: editCategory.description?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editCategory.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
      
      setEditCategoryDialogOpen(false);
      setEditCategory(null);
      fetchData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated videos will also be deleted.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('video_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };
  
  // Video CRUD operations
  const handleAddVideo = async () => {
    try {
      if (!newVideo.title.trim() || !newVideo.youtube_url.trim() || !newVideo.category_id) {
        toast({
          title: 'Validation Error',
          description: 'Title, YouTube URL, and category are required',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('videos')
        .insert({
          title: newVideo.title.trim(),
          description: newVideo.description.trim() || null,
          youtube_url: newVideo.youtube_url.trim(),
          category_id: newVideo.category_id,
          youtube_id: ''
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Video added successfully',
      });
      
      setVideoDialogOpen(false);
      setNewVideo({ title: '', description: '', youtube_url: '', category_id: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding video:', error);
      toast({
        title: 'Error',
        description: 'Failed to add video',
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateVideo = async () => {
    try {
      if (!editVideo || !editVideo.title.trim() || !editVideo.youtube_url.trim() || !editVideo.category_id) {
        toast({
          title: 'Validation Error',
          description: 'Title, YouTube URL, and category are required',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('videos')
        .update({
          title: editVideo.title.trim(),
          description: editVideo.description?.trim() || null,
          youtube_url: editVideo.youtube_url.trim(),
          category_id: editVideo.category_id,
          updated_at: new Date().toISOString(),
          youtube_id: editVideo.youtube_id
        })
        .eq('id', editVideo.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Video updated successfully',
      });
      
      setEditVideoDialogOpen(false);
      setEditVideo(null);
      fetchData();
    } catch (error) {
      console.error('Error updating video:', error);
      toast({
        title: 'Error',
        description: 'Failed to update video',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="categories" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Video Categories</h2>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Category</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="category-name">Name</Label>
                    <Input 
                      id="category-name" 
                      value={newCategory.name} 
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-description">Description (optional)</Label>
                    <Textarea 
                      id="category-description" 
                      value={newCategory.description} 
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      placeholder="Brief description of this category"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddCategory}>Save Category</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories found. Add one to get started.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setEditCategory(category);
                            setEditCategoryDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      {videos.filter(v => v.category_id === category.id).length} videos
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Edit Category Dialog */}
          <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              {editCategory && (
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="edit-category-name">Name</Label>
                    <Input 
                      id="edit-category-name" 
                      value={editCategory.name} 
                      onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category-description">Description (optional)</Label>
                    <Textarea 
                      id="edit-category-description" 
                      value={editCategory.description || ''} 
                      onChange={(e) => setEditCategory({...editCategory, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpdateCategory}>Update Category</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Videos Tab */}
        <TabsContent value="videos">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Videos</h2>
            <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Video</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Video</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="video-title">Title</Label>
                    <Input 
                      id="video-title" 
                      value={newVideo.title} 
                      onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                      placeholder="Video title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="video-category">Category</Label>
                    <select 
                      id="video-category" 
                      className="w-full p-2 border rounded-md" 
                      value={newVideo.category_id}
                      onChange={(e) => setNewVideo({...newVideo, category_id: e.target.value})}
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="video-url">YouTube URL</Label>
                    <Input 
                      id="video-url" 
                      value={newVideo.youtube_url} 
                      onChange={(e) => setNewVideo({...newVideo, youtube_url: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="video-description">Description (optional)</Label>
                    <Textarea 
                      id="video-description" 
                      value={newVideo.description} 
                      onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                      placeholder="Brief description of this video"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddVideo}>Save Video</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <p>Loading videos...</p>
          ) : videos.length === 0 ? (
            <p>No videos found. Add one to get started.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => {
                const category = categories.find(c => c.id === video.category_id);
                return (
                  <Card key={video.id} className="overflow-hidden">
                    <div className="relative aspect-video">
                      {video.thumbnail_url && (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title} 
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                        <a 
                          href={`https://www.youtube.com/watch?v=${video.youtube_id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white p-2 rounded-full"
                        >
                          <Youtube className="h-6 w-6" />
                        </a>
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setEditVideo(video);
                              setEditVideoDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteVideo(video.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {category && (
                        <div className="text-xs font-medium bg-primary/10 text-primary py-1 px-2 rounded inline-block mb-2">
                          {category.name}
                        </div>
                      )}
                      {video.description && (
                        <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Edit Video Dialog */}
          <Dialog open={editVideoDialogOpen} onOpenChange={setEditVideoDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Video</DialogTitle>
              </DialogHeader>
              {editVideo && (
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="edit-video-title">Title</Label>
                    <Input 
                      id="edit-video-title" 
                      value={editVideo.title} 
                      onChange={(e) => setEditVideo({...editVideo, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-video-category">Category</Label>
                    <select 
                      id="edit-video-category" 
                      className="w-full p-2 border rounded-md" 
                      value={editVideo.category_id}
                      onChange={(e) => setEditVideo({...editVideo, category_id: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-video-url">YouTube URL</Label>
                    <Input 
                      id="edit-video-url" 
                      value={editVideo.youtube_url} 
                      onChange={(e) => setEditVideo({...editVideo, youtube_url: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-video-description">Description (optional)</Label>
                    <Textarea 
                      id="edit-video-description" 
                      value={editVideo.description || ''} 
                      onChange={(e) => setEditVideo({...editVideo, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpdateVideo}>Update Video</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoManagement;
