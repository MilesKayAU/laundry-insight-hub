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
  // Safely extract URL from environment variables
  const getUrl = () => {
    // Access the URL from the client file directly
    try {
      const SUPABASE_URL = "https://wtxqdzcihxjaiosmffvm.supabase.co"; // From client.ts
      return SUPABASE_URL;
    } catch (e) {
      return "URL not available";
    }
  };
  
  // Check if there's an API key without exposing it
  const hasApiKey = () => {
    try {
      // Check if there's an API key by checking if auth is available
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

/**
 * Session storage key for the live data mode setting
 */
export const LIVE_DATA_MODE_KEY = 'laundry-hub-live-data-only';

/**
 * Set the application to use only live data from Supabase
 * @param enabled Whether to enable live data only mode
 */
export const setLiveDataOnlyMode = (enabled: boolean) => {
  if (enabled) {
    // Clear localStorage product submissions to ensure no cached data
    localStorage.removeItem("product_submissions");
    
    // Set the flag in sessionStorage
    sessionStorage.setItem(LIVE_DATA_MODE_KEY, 'true');
    console.log("Live Data Only Mode ENABLED - cleared local product data");
  } else {
    sessionStorage.removeItem(LIVE_DATA_MODE_KEY);
    console.log("Live Data Only Mode DISABLED");
  }
  
  // Force page reload to apply changes
  window.location.reload();
};

/**
 * Check if the application is in live data only mode
 */
export const isLiveDataOnlyMode = (): boolean => {
  const isEnabled = sessionStorage.getItem(LIVE_DATA_MODE_KEY) === 'true';
  if (isEnabled) {
    console.log("Live Data Only Mode is active - using only Supabase data");
  }
  return isEnabled;
};

/**
 * User trust levels for product submissions
 */
export enum UserTrustLevel {
  NEW = 'new',
  TRUSTED = 'trusted',
  VERIFIED = 'verified'
}

/**
 * Local storage key for user submission counts
 */
export const USER_SUBMISSIONS_KEY = 'laundry-hub-user-submissions';

/**
 * Get the current upload limits based on user's trust level
 * @param isAdmin Whether the user is an admin
 * @param trustLevel The user's trust level
 * @returns Object containing the maximum allowed uploads
 */
export const getUserUploadLimits = (
  isAdmin: boolean, 
  trustLevel: UserTrustLevel = UserTrustLevel.NEW
): { singleLimit: number, bulkLimit: number, hasLimits: boolean } => {
  if (isAdmin) {
    return { singleLimit: Infinity, bulkLimit: Infinity, hasLimits: false };
  }
  
  switch (trustLevel) {
    case UserTrustLevel.VERIFIED:
      return { singleLimit: Infinity, bulkLimit: 20, hasLimits: true };
    case UserTrustLevel.TRUSTED:
      return { singleLimit: 10, bulkLimit: 10, hasLimits: true };
    case UserTrustLevel.NEW:
    default:
      return { singleLimit: 3, bulkLimit: 3, hasLimits: true };
  }
};

/**
 * Get the user's current trust level based on approved submissions
 * @param userId The user's ID
 * @returns The user's trust level
 */
export const getUserTrustLevel = async (userId?: string): Promise<UserTrustLevel> => {
  if (!userId) {
    return UserTrustLevel.NEW;
  }
  
  try {
    // Check if user is an admin (they automatically get VERIFIED status)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .limit(1);
    
    if (roleData && roleData.length > 0) {
      return UserTrustLevel.VERIFIED;
    }
    
    // Count approved submissions for this user
    const { data, error } = await supabase
      .from('product_submissions')
      .select('id', { count: 'exact' })
      .eq('owner_id', userId)
      .eq('approved', true);
    
    if (error) {
      console.error("Error checking user approved submissions:", error);
      return UserTrustLevel.NEW;
    }
    
    const approvedCount = data?.length || 0;
    
    if (approvedCount >= 10) {
      return UserTrustLevel.VERIFIED;
    } else if (approvedCount >= 3) {
      return UserTrustLevel.TRUSTED;
    } else {
      return UserTrustLevel.NEW;
    }
  } catch (error) {
    console.error("Error determining user trust level:", error);
    return UserTrustLevel.NEW;
  }
};

/**
 * Check if the user can make more submissions
 * @param userId User ID
 * @param isAdmin Whether the user is an admin
 * @param isBulkUpload Whether this is a bulk upload check
 * @param requestedCount Number of items the user is trying to submit
 * @returns Object with allowed status and limit information
 */
export const checkUserSubmissionLimits = async (
  userId?: string,
  isAdmin = false,
  isBulkUpload = false,
  requestedCount = 1
): Promise<{
  allowed: boolean;
  remainingAllowed: number;
  maxAllowed: number;
  trustLevel: UserTrustLevel;
}> => {
  // Admins can always submit unlimited products
  if (isAdmin) {
    return {
      allowed: true,
      remainingAllowed: Infinity,
      maxAllowed: Infinity,
      trustLevel: UserTrustLevel.VERIFIED
    };
  }
  
  // For non-authenticated users, use strict limits
  if (!userId) {
    const limits = getUserUploadLimits(false, UserTrustLevel.NEW);
    const limit = isBulkUpload ? limits.bulkLimit : limits.singleLimit;
    
    return {
      allowed: requestedCount <= limit,
      remainingAllowed: Math.max(0, limit - requestedCount),
      maxAllowed: limit,
      trustLevel: UserTrustLevel.NEW
    };
  }
  
  // Get user's trust level
  const trustLevel = await getUserTrustLevel(userId);
  
  // Get pending submissions count from localStorage
  const pendingSubmissions = getPendingSubmissionCount(userId);
  
  // Calculate limits based on trust level
  const limits = getUserUploadLimits(false, trustLevel);
  const limit = isBulkUpload ? limits.bulkLimit : limits.singleLimit;
  
  // Check if user can submit more
  const remainingAllowed = Math.max(0, limit - pendingSubmissions);
  const allowed = requestedCount <= remainingAllowed;
  
  return {
    allowed,
    remainingAllowed,
    maxAllowed: limit,
    trustLevel
  };
};

/**
 * Get the count of pending submissions for a user
 * @param userId User ID
 * @returns Number of pending submissions
 */
export const getPendingSubmissionCount = (userId?: string): number => {
  if (!userId) return 0;
  
  try {
    const submissionsData = localStorage.getItem(USER_SUBMISSIONS_KEY);
    if (!submissionsData) return 0;
    
    const submissions = JSON.parse(submissionsData);
    return submissions[userId] || 0;
  } catch (e) {
    console.error("Error getting pending submission count:", e);
    return 0;
  }
};

/**
 * Update the count of pending submissions for a user
 * @param userId User ID
 * @param count Number of new submissions
 */
export const updatePendingSubmissionCount = (userId?: string, count = 1): void => {
  if (!userId) return;
  
  try {
    const submissionsData = localStorage.getItem(USER_SUBMISSIONS_KEY);
    const submissions = submissionsData ? JSON.parse(submissionsData) : {};
    
    submissions[userId] = (submissions[userId] || 0) + count;
    
    localStorage.setItem(USER_SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.error("Error updating pending submission count:", e);
  }
};
