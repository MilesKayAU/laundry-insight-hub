
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, ArrowLeft, Eye, Image as ImageIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import AdminGuard from "@/components/AdminGuard";
import { Switch } from "@/components/ui/switch";

// Third-party markdown editor would be added here in a real app
// For simplicity, we'll use a textarea for content

const EditBlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isNewPost = id === "new";

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      published: false,
    },
  });

  // Fetch post data if editing an existing post
  const { isLoading } = useQuery({
    queryKey: ["blog-post-edit", id],
    queryFn: async () => {
      if (isNewPost) return null;
      
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !isNewPost,
    onSuccess: (data) => {
      if (data) {
        // Reset form with existing post data
        form.reset({
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          featured_image: data.featured_image || "",
          published: data.published || false,
        });
      }
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title" && value.title) {
        const slug = value.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-");
        
        form.setValue("slug", slug);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const savePostMutation = useMutation({
    mutationFn: async (values) => {
      const { title, slug, excerpt, content, featured_image, published } = values;
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");
      
      if (isNewPost) {
        // Create new post
        const { data, error } = await supabase
          .from("blog_posts")
          .insert({
            title,
            slug,
            excerpt,
            content,
            featured_image,
            published,
            author_id: user.id,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Update existing post
        const { data, error } = await supabase
          .from("blog_posts")
          .update({
            title,
            slug,
            excerpt,
            content,
            featured_image,
            published,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", data.slug] });
      
      toast({
        title: isNewPost ? "Post created" : "Post updated",
        description: `The blog post has been ${isNewPost ? "created" : "updated"} successfully.`,
      });
      
      // Navigate to the blog post page or back to the post list
      navigate(`/blog/${data.slug}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to save post",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const onSubmit = (values) => {
    setIsSaving(true);
    savePostMutation.mutate(values);
  };

  const handlePreview = () => {
    // In a real app, this would open a preview modal or a new tab
    toast({
      title: "Preview feature",
      description: "This would show a preview of the post in a real application.",
    });
  };

  return (
    <AdminGuard>
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {isNewPost ? "Create New Blog Post" : "Edit Blog Post"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>

        {isLoading && !isNewPost ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-science-600" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="post-url-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL-friendly identifier for this post
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief summary of the post" 
                        className="h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A short description that appears in blog listings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                        <Button type="button" variant="outline" className="ml-2">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Browse
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      URL to the main image for this post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your post content here" 
                        className="min-h-[300px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Publish
                      </FormLabel>
                      <FormDescription>
                        Make this post visible to the public
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </div>
    </AdminGuard>
  );
};

export default EditBlogPostPage;
