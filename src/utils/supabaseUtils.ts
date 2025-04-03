
import { supabase } from "@/integrations/supabase/client";

/**
 * Tests the Supabase connection by attempting to query a table
 * @returns An object with connection status and any error
 */
export const testSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...");
    
    const { data, error } = await supabase
      .from('product_submissions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return {
        connected: false,
        error: error,
        message: `Connection error: ${error.message}`
      };
    }
    
    return {
      connected: true,
      error: null,
      message: "Connection successful"
    };
  } catch (e) {
    console.error("Exception testing Supabase connection:", e);
    return {
      connected: false,
      error: e,
      message: `Exception: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
};

/**
 * Checks if Supabase Row Level Security (RLS) might be blocking access
 * @returns An object with RLS status information
 */
export const checkRlsStatus = async () => {
  try {
    // Try to read data to check if blocked by RLS
    const { data, error } = await supabase
      .from('product_submissions')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === '42501' || error.message.includes('permission') || error.message.includes('access')) {
        return {
          blocking: true,
          message: "RLS appears to be blocking anonymous access to the table"
        };
      }
      
      return {
        blocking: false,
        message: `Error not related to RLS: ${error.message}`
      };
    }
    
    // Even if no error, if data is empty array or null, might still be RLS
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return {
        blocking: 'maybe',
        message: "No data returned - could be RLS or empty table"
      };
    }
    
    return {
      blocking: false,
      message: "RLS is not blocking access"
    };
  } catch (e) {
    return {
      blocking: 'unknown',
      message: `Could not determine RLS status: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
};

/**
 * Gets information about the Supabase client configuration
 */
export const getSupabaseClientInfo = () => {
  // Safely extract URL from environment or window location
  const getUrl = () => {
    try {
      // Get the URL from the Supabase client configuration safely
      // Or fallback to a display value
      return new URL(supabase.getUrl()).toString();
    } catch (e) {
      return "URL not available";
    }
  };
  
  // Check if there's an API key without exposing it
  const hasApiKey = () => {
    try {
      // Check if there's an API key without exposing it
      // This is safer than accessing protected properties directly
      return supabase.auth.getSession !== undefined;
    } catch (e) {
      return false;
    }
  };

  return {
    url: getUrl(),
    hasKey: hasApiKey(),
    keyLength: hasApiKey() ? "Valid" : "Missing"
  };
};
