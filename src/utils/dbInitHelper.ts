
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Helper function to check if the active_sessions functions exists
 * @returns Promise<boolean> indicating if the functions exist
 */
export const checkActiveSessionsTable = async (): Promise<boolean> => {
  try {
    // Try a function call that would fail if the function doesn't exist
    // Use type assertion to bypass TypeScript's type checking
    const { error } = await (supabase.rpc as any)('check_active_session', {
      user_email: 'test@example.com'
    });
    
    // If there's no error or the error is just "no rows returned", the function exists
    return !error || error.code === 'PGRST116';
  } catch (error) {
    console.error('Error checking active sessions setup:', error);
    return false;
  }
};

/**
 * This function can be called to ensure the database is properly set up
 * It will show a toast message with instructions if the setup is not complete
 */
export const ensureDatabaseSetup = async (): Promise<void> => {
  const isSetup = await checkActiveSessionsTable();
  
  if (!isSetup) {
    toast.error(
      'Database setup incomplete. Please contact the administrator to run the setup script.',
      {
        duration: 6000,
        action: {
          label: 'Dismiss',
          onClick: () => {}
        }
      }
    );
  }
};
