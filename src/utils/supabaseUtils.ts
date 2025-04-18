
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to execute a custom SQL query (used for development/testing)
 * @param sqlQuery - The SQL query to execute
 * @returns Promise with the query result
 */
export const executeCustomQuery = async (sqlQuery: string) => {
  try {
    // This is a workaround for direct SQL execution
    // For production, it's better to use stored procedures
    const { data, error } = await supabase.functions.invoke('execute_query', {
      body: { query_text: sqlQuery }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('SQL Query Execution Error:', error);
    throw error;
  }
};

/**
 * Check if a user is already logged in elsewhere
 * @param email - The user's email
 * @returns Promise<boolean> indicating if the user has an active session
 */
export const checkActiveSession = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('check_active_session', {
      body: { user_email: email }
    });

    if (error) {
      console.error('Error checking active session:', error);
      return false;
    }

    // Fix for data possibly being null
    return !!data && (data as { exists: boolean }).exists;
  } catch (error) {
    console.error('Error in checkActiveSession:', error);
    return false;
  }
};

/**
 * Set a user as active in the active_sessions table
 * @param userId - The user's ID
 * @param email - The user's email
 * @param sessionId - Unique identifier for this session
 */
export const setActiveSession = async (
  userId: string, 
  email: string, 
  sessionId: string
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('set_active_session', {
      body: {
        user_id: userId,
        user_email: email,
        session_identifier: sessionId,
        activity_time: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Error setting active session:', error);
    }
  } catch (error) {
    console.error('Error in setActiveSession:', error);
  }
};

/**
 * Remove a user from the active_sessions table
 * @param userId - The user's ID
 */
export const removeActiveSession = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('remove_active_session', {
      body: { user_id: userId }
    });

    if (error) {
      console.error('Error removing active session:', error);
    }
  } catch (error) {
    console.error('Error in removeActiveSession:', error);
  }
};

/**
 * Remove a user from the active_sessions table by email
 * @param email - The user's email
 */
export const removeActiveSessionByEmail = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('remove_active_session_by_email', {
      body: { user_email: email }
    });

    if (error) {
      console.error('Error removing active session by email:', error);
    }
  } catch (error) {
    console.error('Error in removeActiveSessionByEmail:', error);
  }
};

/**
 * Cleanup old sessions (older than 24 hours)
 * This function can be called periodically to clean up the database
 */
export const cleanupOldSessions = async (): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('cleanup_old_sessions');
    
    if (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  } catch (error) {
    console.error('Error in cleanupOldSessions:', error);
  }
};

/**
 * Setup function to initialize the database tables and functions needed
 * This should be run once to set up the required database structure
 */
export const setupActiveSessionsTable = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('setup_active_sessions');
    
    if (error) {
      console.error('Error setting up active sessions:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Setup Error:', error);
    return false;
  }
};
