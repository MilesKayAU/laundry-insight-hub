
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      // Get published posts
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, created_at, author_id")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // If no posts, return empty array
      if (!posts || posts.length === 0) return [];
      
      // Get all unique author IDs
      const authorIds = [...new Set(posts.map(post => post.author_id))];
      
      // Get all authors in a single query
      const { data: authors } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", authorIds);
      
      // Create a map of authors by ID for easy lookup
      const authorMap = {};
      if (authors) {
        authors.forEach(author => {
          authorMap[author.id] = author;
        });
      }
      
      // Add author data to each post
      return posts.map(post => ({
        ...post,
        author: authorMap[post.author_id] || { full_name: "Admin" }
      }));
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      // Get the post
      const { data: post, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      
      if (error) throw error;
      
      // Get the author
      if (post) {
        const { data: author } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", post.author_id)
          .single();
        
        return {
          ...post,
          author: author || { full_name: "Admin" }
        };
      }
      
      return post;
    },
    enabled: !!slug,
  });
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ["user-is-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
      if (error) return false;
      return data;
    },
  });
}
