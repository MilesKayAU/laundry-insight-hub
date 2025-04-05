
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Pencil, Plus, RotateCw, Video, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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

const VideoManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVideo, setSavingVideo] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Form states
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    youtube_url: '',
    category_id: ''
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [editCategory, setEditCategory] = useState<VideoCategory | null>(null);
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  
  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editVideoDialogOpen, setEditVideoDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching video data...");
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('video_categories')
        .select('*')
        .order('name');
      
      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw categoriesError;
      }
      
      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('title');
      
      if (videosError) {
        console.error("Error fetching videos:", videosError);
        throw videosError;
      }
      
      console.log("Fetched categories:", categoriesData?.length || 0);
      console.log("Fetched videos:", videosData?.length || 0);
      
      setCategories(categoriesData || []);
      setVideos(videosData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load video data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSavingCategory(true);
      console.log("Adding new category:", newCategory);
      
      const { data, error } = await supabase
        .from('video_categories')
        .insert([{ 
          name: newCategory.name,
          description: newCategory.description || null
        }])
        .select();
      
      if (error) {
        console.error("Error adding category:", error);
        throw error;
      }
      
      console.log("Category added successfully:", data);
      
      // Reset the form
      setNewCategory({
        name: '',
        description: ''
      });
      
      setCategoryDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
      
      // Refresh data to ensure we have the latest from the server
      await fetchData();
      
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add category',
        variant: 'destructive',
      });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory || !editCategory.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSavingCategory(true);
      console.log("Updating category:", editCategory);
      
      const { error } = await supabase
        .from('video_categories')
        .update({ 
          name: editCategory.name,
          description: editCategory.description
        })
        .eq('id', editCategory.id);
      
      if (error) {
        console.error("Error updating category:", error);
        throw error;
      }
      
      console.log("Category updated successfully");
      
      setEditCategoryDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
      
      // Refresh data to ensure we have the latest from the server
      await fetchData();
      
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update category',
        variant: 'destructive',
      });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setDeleting(categoryId);
      console.log("Deleting category:", categoryId);
      
      // First check if there are any videos in this category
      const videosInCategory = videos.filter(v => v.category_id === categoryId);
      
      if (videosInCategory.length > 0) {
        console.log(`Found ${videosInCategory.length} videos to delete in this category`);
        
        // Delete all videos in this category first
        for (const video of videosInCategory) {
          console.log("Deleting video in category:", video.id);
          const { error: videoError } = await supabase
            .from('videos')
            .delete()
            .eq('id', video.id);
          
          if (videoError) {
            console.error("Error deleting video:", videoError);
            throw videoError;
          }
        }
      }
      
      // Then delete the category
      const { error } = await supabase
        .from('video_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) {
        console.error("Error deleting category:", error);
        throw error;
      }
      
      console.log("Category deleted successfully");
      
      toast({
        title: 'Success',
        description: 'Category and its videos deleted successfully',
      });
      
      // Refresh data to ensure we have the latest from the server
      await fetchData();
      
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const extractYoutubeId = (url: string): string => {
    let youtubeId = '';
    
    // Extract YouTube ID from different URL formats
    if (url.includes('youtube.com/watch?v=')) {
      const match = url.match(/v=([^&]+)/);
      if (match) youtubeId = match[1];
    } else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?]+)/);
      if (match) youtubeId = match[1];
    } else if (url.includes('youtube.com/embed/')) {
      const match = url.match(/embed\/([^?]+)/);
      if (match) youtubeId = match[1];
    } else {
      youtubeId = url; // Just use the URL as-is if no pattern matches
    }
    
    return youtubeId;
  };

  const handleAddVideo = async () => {
    if (!newVideo.title.trim() || !newVideo.youtube_url.trim() || !newVideo.category_id) {
      toast({
        title: 'Validation Error',
        description: 'Title, YouTube URL, and category are required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSavingVideo(true);
      console.log("Adding new video:", newVideo);
      
      const youtubeId = extractYoutubeId(newVideo.youtube_url);
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      
      const { data, error } = await supabase
        .from('videos')
        .insert({ 
          title: newVideo.title,
          description: newVideo.description || null,
          youtube_url: newVideo.youtube_url,
          category_id: newVideo.category_id,
          youtube_id: youtubeId,
          thumbnail_url: thumbnailUrl
        })
        .select();
      
      if (error) {
        console.error("Error adding video:", error);
        throw error;
      }
      
      console.log("Video added successfully:", data);
      
      // Reset the form
      setNewVideo({
        title: '',
        description: '',
        youtube_url: '',
        category_id: ''
      });
      
      setVideoDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Video added successfully',
      });
      
      // Refresh data to ensure we have the latest from the server
      await fetchData();
      
    } catch (error: any) {
      console.error('Error adding video:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add video',
        variant: 'destructive',
      });
    } finally {
      setSavingVideo(false);
    }
  };

  const handleUpdateVideo = async () => {
    if (!editVideo || !editVideo.title.trim() || !editVideo.youtube_url.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and YouTube URL are required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSavingVideo(true);
      console.log("Updating video:", editVideo);
      
      const youtubeId = extractYoutubeId(editVideo.youtube_url);
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      
      // Prepare the update payload with explicit null for description if it's empty
      const updatePayload = { 
        title: editVideo.title,
        description: editVideo.description || null,
        youtube_url: editVideo.youtube_url,
        category_id: editVideo.category_id,
        youtube_id: youtubeId,
        thumbnail_url: thumbnailUrl
      };
      
      console.log("Sending update with payload:", updatePayload);
      
      const { error } = await supabase
        .from('videos')
        .update(updatePayload)
        .eq('id', editVideo.id);
      
      if (error) {
        console.error("Error updating video:", error);
        throw error;
      }
      
      console.log("Video updated successfully");
      
      setEditVideoDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Video updated successfully',
      });
      
      // Refresh data to ensure we have the latest from the server
      await fetchData();
      
    } catch (error: any) {
      console.error('Error updating video:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update video',
        variant: 'destructive',
      });
    } finally {
      setSavingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      setDeleting(videoId);
      console.log("Deleting video:", videoId);
      
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);
      
      if (error) {
        console.error("Error deleting video:", error);
        throw error;
      }
      
      console.log("Video deleted successfully");
      
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      
      // Refresh data to ensure we have the latest from the server
      await fetchData();
      
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete video',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const openEditCategoryDialog = (category: VideoCategory) => {
    setEditCategory({ ...category });
    setEditCategoryDialogOpen(true);
  };

  const openEditVideoDialog = (video: Video) => {
    setEditVideo({ ...video });
    setEditVideoDialogOpen(true);
  };

  // Group videos by category for display
  const videosByCategory = categories.map(category => ({
    category,
    videos: videos.filter(video => video.category_id === category.id)
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Video Management</CardTitle>
        <CardDescription>
          Manage educational videos and categories
        </CardDescription>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RotateCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new video category for organizing educational content.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g. PVA Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Optional description of this category"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddCategory} 
                  disabled={savingCategory || !newCategory.name.trim()}
                >
                  {savingCategory && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Video className="h-4 w-4 mr-2" />
                New Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
                <DialogDescription>
                  Add a new educational video from YouTube.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="videoTitle">Video Title *</Label>
                  <Input
                    id="videoTitle"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    placeholder="Video title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoDescription">Description</Label>
                  <Textarea
                    id="videoDescription"
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    placeholder="Optional video description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                  <Input
                    id="youtubeUrl"
                    value={newVideo.youtube_url}
                    onChange={(e) => setNewVideo({ ...newVideo, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoCategory">Category *</Label>
                  <Select
                    value={newVideo.category_id}
                    onValueChange={(value) => setNewVideo({ ...newVideo, category_id: value })}
                  >
                    <SelectTrigger id="videoCategory">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddVideo} 
                  disabled={savingVideo || !newVideo.title.trim() || !newVideo.youtube_url.trim() || !newVideo.category_id}
                >
                  {savingVideo && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Add Video
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="categories">
            <TabsList className="mb-4">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No categories found. Create a new category to get started.
                  </div>
                ) : (
                  categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {videos.filter(v => v.category_id === category.id).length} videos
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditCategoryDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deleting === category.id}
                            >
                              {deleting === category.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the category "{category.name}" and all videos in this category. 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="videos">
              <div className="space-y-8">
                {videos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No videos found. Add videos to get started.
                  </div>
                ) : (
                  videosByCategory.map(({ category, videos }) => (
                    videos.length > 0 && (
                      <div key={category.id} className="space-y-3">
                        <h3 className="font-medium border-b pb-1">{category.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {videos.map(video => (
                            <div key={video.id} className="border rounded-md overflow-hidden">
                              <div className="aspect-video relative bg-muted">
                                {video.thumbnail_url ? (
                                  <img 
                                    src={video.thumbnail_url} 
                                    alt={video.title} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`;
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Video className="h-12 w-12 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3">
                                <h4 className="font-medium truncate" title={video.title}>{video.title}</h4>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{video.description}</p>
                                )}
                                <div className="flex justify-end mt-3 space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditVideoDialog(video)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        disabled={deleting === video.id}
                                      >
                                        {deleting === video.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{video.title}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive hover:bg-destructive/90"
                                          onClick={() => handleDeleteVideo(video.id)}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Edit Category Dialog */}
        <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the video category details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName">Category Name *</Label>
                <Input
                  id="editCategoryName"
                  value={editCategory?.name || ''}
                  onChange={(e) => setEditCategory(editCategory ? { ...editCategory, name: e.target.value } : null)}
                  placeholder="e.g. PVA Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCategoryDescription">Description</Label>
                <Textarea
                  id="editCategoryDescription"
                  value={editCategory?.description || ''}
                  onChange={(e) => setEditCategory(editCategory ? { ...editCategory, description: e.target.value } : null)}
                  placeholder="Optional description of this category"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleUpdateCategory} 
                disabled={savingCategory || !editCategory?.name?.trim()}
              >
                {savingCategory && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Video Dialog */}
        <Dialog open={editVideoDialogOpen} onOpenChange={setEditVideoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
              <DialogDescription>
                Update video details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editVideoTitle">Video Title *</Label>
                <Input
                  id="editVideoTitle"
                  value={editVideo?.title || ''}
                  onChange={(e) => setEditVideo(editVideo ? { ...editVideo, title: e.target.value } : null)}
                  placeholder="Video title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editVideoDescription">Description</Label>
                <Textarea
                  id="editVideoDescription"
                  value={editVideo?.description || ''}
                  onChange={(e) => setEditVideo(editVideo ? { ...editVideo, description: e.target.value } : null)}
                  placeholder="Optional video description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editYoutubeUrl">YouTube URL *</Label>
                <Input
                  id="editYoutubeUrl"
                  value={editVideo?.youtube_url || ''}
                  onChange={(e) => setEditVideo(editVideo ? { ...editVideo, youtube_url: e.target.value } : null)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editVideoCategory">Category *</Label>
                <Select
                  value={editVideo?.category_id || ''}
                  onValueChange={(value) => setEditVideo(editVideo ? { ...editVideo, category_id: value } : null)}
                >
                  <SelectTrigger id="editVideoCategory">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleUpdateVideo} 
                disabled={savingVideo || !editVideo?.title?.trim() || !editVideo?.youtube_url?.trim()}
              >
                {savingVideo && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VideoManagement;
