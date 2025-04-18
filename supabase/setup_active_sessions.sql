
-- Create the active_sessions table
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  session_id TEXT NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_active_sessions_email ON public.active_sessions(email);

-- Function to check if a user is already logged in
CREATE OR REPLACE FUNCTION public.check_active_session(user_email TEXT)
RETURNS TABLE (exists BOOLEAN) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY 
  SELECT COUNT(*) > 0 FROM public.active_sessions
  WHERE email = user_email;
END;
$$;

-- Function to set a user as active
CREATE OR REPLACE FUNCTION public.set_active_session(
  user_id UUID,
  user_email TEXT,
  session_identifier TEXT,
  activity_time TIMESTAMP WITH TIME ZONE
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.active_sessions (id, email, session_id, last_activity)
  VALUES (user_id, user_email, session_identifier, activity_time)
  ON CONFLICT (id) 
  DO UPDATE SET 
    session_id = EXCLUDED.session_id,
    last_activity = EXCLUDED.last_activity;
END;
$$;

-- Function to remove a user from active sessions
CREATE OR REPLACE FUNCTION public.remove_active_session(user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.active_sessions WHERE id = user_id;
END;
$$;

-- Function to remove a user from active sessions by email
CREATE OR REPLACE FUNCTION public.remove_active_session_by_email(user_email TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.active_sessions WHERE email = user_email;
END;
$$;

-- Function to clean up old sessions (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.active_sessions 
  WHERE last_activity < (NOW() - INTERVAL '24 hours');
END;
$$;

-- Add RLS policies for the active_sessions table
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own session information
CREATE POLICY "Users can read their own active session"
  ON public.active_sessions
  FOR SELECT
  USING (auth.uid() = id);

-- Policy to allow users to update their own session
CREATE POLICY "Users can update their own active session"
  ON public.active_sessions
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy to allow users to delete their own session
CREATE POLICY "Users can delete their own active session"
  ON public.active_sessions
  FOR DELETE
  USING (auth.uid() = id);

-- Policy to allow users to insert their own session
CREATE POLICY "Users can insert their own active session"
  ON public.active_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions for RPC functions
GRANT EXECUTE ON FUNCTION public.check_active_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_active_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remove_active_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remove_active_session_by_email TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_sessions TO anon, authenticated;
