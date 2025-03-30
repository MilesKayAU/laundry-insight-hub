
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import { Loader2, RefreshCw } from "lucide-react";
import { useBlogPosts } from "@/hooks/use-blog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const BlogPage = () => {
  const queryClient = useQueryClient();
  const { data: posts, isLoading, error, refetch } = useBlogPosts();

  useEffect(() => {
    // Log the state of the blog posts for debugging
    console.log("Blog Page - Loading:", isLoading);
    console.log("Blog Page - Error:", error);
    console.log("Blog Page - Posts:", posts);
  }, [isLoading, error, posts]);

  const handleRefresh = () => {
    console.log("Manually refreshing blog posts...");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600 mb-4" />
        <p className="text-gray-600">Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error loading blog posts. Please try again later.
          <pre className="mt-2 text-xs">{error.message}</pre>
        </div>
        <Button onClick={handleRefresh} className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-science-700 to-tech-600 bg-clip-text text-transparent">
        Blog
      </h1>
      
      {posts && posts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.slug}`}
              className="group"
            >
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-all duration-300 hover:shadow-lg">
                {post.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 group-hover:text-science-600">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mb-3 text-gray-600 line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {post.author?.full_name || "Unknown"}
                    </span>
                    <span>
                      {formatDistance(new Date(post.created_at), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No blog posts available yet. Check back soon!</p>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center mx-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
