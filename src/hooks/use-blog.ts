
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      try {
        console.log("Fetching blog posts...");
        // Get published posts
        const { data: posts, error } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, featured_image, created_at, author_id")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching blog posts:", error);
          throw error;
        }
        
        console.log("Retrieved posts:", posts?.length || 0);
        
        // If no posts, return empty array
        if (!posts || posts.length === 0) return [];
        
        // Get all unique author IDs
        const authorIds = [...new Set(posts.map(post => post.author_id))];
        console.log("Author IDs to fetch:", authorIds);
        
        // Get all authors in a single query
        const { data: authors, error: authorsError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", authorIds);
        
        if (authorsError) {
          console.error("Error fetching authors:", authorsError);
        }
        
        // Create a map of authors by ID for easy lookup
        const authorMap = {};
        if (authors) {
          authors.forEach(author => {
            authorMap[author.id] = author;
          });
        }
        
        // Add author data to each post
        const resultPosts = posts.map(post => ({
          ...post,
          author: authorMap[post.author_id] || { full_name: "Unknown" }
        }));

        console.log("Processed posts with authors:", resultPosts.length);
        return resultPosts;
      } catch (error) {
        console.error("Exception in useBlogPosts:", error);
        return [];
      }
    },
    retryOnMount: true,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      try {
        console.log("Fetching blog post with slug:", slug);
        
        // Get the post - NOTE: Removing published filter to make sure we can get all posts
        const { data: post, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .single();
        
        if (error) {
          console.error("Error fetching blog post:", error);
          throw error;
        }
        
        console.log("Retrieved post:", post?.title);
        
        // Get the author
        if (post) {
          const { data: author, error: authorError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", post.author_id)
            .single();
          
          if (authorError) {
            console.error("Error fetching author:", authorError);
          }
          
          return {
            ...post,
            author: author || { full_name: "Unknown" }
          };
        }
        
        return null;
      } catch (error) {
        console.error("Exception in useBlogPost:", error);
        return null;
      }
    },
    enabled: !!slug,
    retry: 2,
  });
}

export function useIsAdmin() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-is-admin"],
    queryFn: async () => {
      // Check if user exists first
      if (!user) {
        console.log("Admin check: No user found");
        return false;
      }

      console.log("Admin check for user:", user.email);
      
      // Special case for specific admin
      if (user.email && user.email.toLowerCase() === 'mileskayaustralia@gmail.com') {
        console.log("Admin check: Granting admin access for special user");
        return true;
      }
      
      try {
        // Fallback to checking the admin role in the database
        const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
        
        if (error) {
          console.error("Error checking admin role:", error);
          // Special case - if error occurs for the admin user, grant access anyway
          if (user.email && user.email.toLowerCase() === 'mileskayaustralia@gmail.com') {
            return true;
          }
          return false;
        }
        
        console.log("Admin check via RPC:", !!data);
        return !!data;
      } catch (err) {
        console.error("Exception in admin role check:", err);
        // If exception, grant admin access only to our special user
        return user.email?.toLowerCase() === 'mileskayaustralia@gmail.com';
      }
    },
    enabled: !!user,
    staleTime: 5000, // Cache result for 5 seconds only
    retry: 1, // Try once more if it fails
  });
}
