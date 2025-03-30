
import React from "react";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import { Loader2 } from "lucide-react";
import { useBlogPosts } from "@/hooks/use-blog";

const BlogPage = () => {
  const { data: posts, isLoading, error } = useBlogPosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-science-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading blog posts. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-science-700 to-tech-600 bg-clip-text text-transparent">
        Blog
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
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
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No blog posts available yet. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
