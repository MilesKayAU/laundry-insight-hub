
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Calendar, User, Edit } from "lucide-react";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      // Check if user is admin to determine if we should fetch unpublished posts
      const isAdmin = await supabase.rpc('has_role', { role: 'admin' });
      
      let query = supabase
        .from("blog_posts")
        .select("*, profiles(full_name)")
        .eq("slug", slug)
        .single();
      
      // If not admin, only fetch published posts
      if (!isAdmin) {
        query = query.eq("published", true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  // If blog post not found or error, redirect to blog index
  useEffect(() => {
    if (error && !isLoading) {
      navigate("/blog");
    }
  }, [error, isLoading, navigate]);

  // Check if current user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["user-is-admin"],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
      if (error) return false;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600" />
      </div>
    );
  }

  if (!post) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/blog" className="inline-flex items-center text-science-600 hover:text-science-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>
      </div>

      {post.featured_image && (
        <div className="mb-8 h-64 md:h-96 overflow-hidden rounded-xl">
          <img
            src={post.featured_image}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex flex-wrap items-center gap-4 mb-8 text-gray-600">
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          <span>{formatDistance(new Date(post.created_at), new Date(), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          <span>{post.profiles?.full_name || "Admin"}</span>
        </div>
        
        {isAdmin && (
          <Link to={`/admin/blog/edit/${post.id}`}>
            <Button variant="outline" size="sm" className="ml-auto">
              <Edit className="mr-2 h-4 w-4" />
              Edit Post
            </Button>
          </Link>
        )}
      </div>

      {!post.published && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
          This post is currently unpublished and only visible to admins.
        </div>
      )}
      
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default BlogPostPage;
