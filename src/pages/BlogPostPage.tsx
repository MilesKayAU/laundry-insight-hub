
import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Calendar, User, Edit } from "lucide-react";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogPost, useIsAdmin } from "@/hooks/use-blog";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: post, isLoading, error } = useBlogPost(slug);
  const { data: isAdmin } = useIsAdmin();

  // If blog post not found or error, redirect to blog index
  useEffect(() => {
    if (error && !isLoading) {
      navigate("/blog");
    }
  }, [error, isLoading, navigate]);

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
          <span>{post.author?.full_name || "Unknown"}</span>
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
