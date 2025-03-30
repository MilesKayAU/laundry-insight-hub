
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      try {
        console.log("Fetching blog posts...");
        // Get ALL posts - not just published ones
        const { data: posts, error } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, featured_image, created_at, author_id, published")
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
        throw error; // Re-throw the error to be handled by React Query
      }
    },
    retryOnMount: true,
    staleTime: 0, // Consider data fresh for 0 seconds (always refetch)
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      try {
        console.log("Fetching blog post with slug:", slug);
        
        // Get the post - without any filters
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
        throw error; // Re-throw the error
      }
    },
    enabled: !!slug,
    retry: 3, // Try more times if it fails
  });
}

export function useIsAdmin() {
  const { user } = useAuth();
  
  // Define admins directly - this serves as a fallback if the database check fails
  const ADMIN_EMAILS = ['mileskayaustralia@gmail.com'];
  
  return useQuery({
    queryKey: ["user-is-admin"],
    queryFn: async () => {
      // Check if user exists first
      if (!user) {
        console.log("Admin check: No user found");
        return false;
      }

      console.log("Admin check for user:", user.email);
      
      // Special case for specific admin - Direct check first
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        console.log("Admin check: Granting admin access for special user");
        return true;
      }
      
      try {
        // Fallback to checking the admin role in the database
        const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
        
        if (error) {
          console.error("Error checking admin role:", error);
          
          // Special case - if error occurs for an admin user, grant access anyway
          if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
            console.log("Admin check: Error occurred but user is special admin, granting access");
            return true;
          }
          throw error; // Re-throw to be handled by error boundary
        }
        
        console.log("Admin check via RPC:", !!data);
        return !!data;
      } catch (err) {
        console.error("Exception in admin role check:", err);
        
        // If exception, grant admin access only to our special users
        const isSpecialAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
        console.log("Admin check: Exception occurred, is special admin?", isSpecialAdmin);
        return isSpecialAdmin;
      }
    },
    enabled: !!user,
    staleTime: 0, // Always refetch
    retry: 2, // Try more times if it fails
  });
}
