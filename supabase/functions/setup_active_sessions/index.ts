
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Execute the SQL to create the active_sessions table and related functions
    const setupSql = `
      -- Create active_sessions table if it doesn't exist
      CREATE TABLE IF NOT EXISTS public.active_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        email TEXT NOT NULL,
        session_id TEXT NOT NULL,
        last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        UNIQUE (user_id)
      );

      -- Functions for session management
      CREATE OR REPLACE FUNCTION public.check_active_session_by_email(p_email TEXT)
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        session_exists BOOLEAN;
      BEGIN
        SELECT EXISTS (
          SELECT 1 FROM public.active_sessions
          WHERE email = p_email
        ) INTO session_exists;
        
        RETURN session_exists;
      END;
      $$;

      CREATE OR REPLACE FUNCTION public.set_active_session(
        p_user_id UUID,
        p_email TEXT,
        p_session_id TEXT,
        p_activity_time TIMESTAMP WITH TIME ZONE
      )
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- Insert or update the session
        INSERT INTO public.active_sessions (user_id, email, session_id, last_activity)
        VALUES (p_user_id, p_email, p_session_id, p_activity_time)
        ON CONFLICT (user_id)
        DO UPDATE SET
          session_id = p_session_id,
          last_activity = p_activity_time;
      END;
      $$;

      CREATE OR REPLACE FUNCTION public.remove_active_session(p_user_id UUID)
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        DELETE FROM public.active_sessions WHERE user_id = p_user_id;
      END;
      $$;

      CREATE OR REPLACE FUNCTION public.remove_active_session_by_email(p_email TEXT)
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        DELETE FROM public.active_sessions WHERE email = p_email;
      END;
      $$;

      CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
      RETURNS INTEGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        removed INTEGER;
      BEGIN
        DELETE FROM public.active_sessions
        WHERE last_activity < (now() - interval '1 day')
        RETURNING COUNT(*) INTO removed;
        
        RETURN removed;
      END;
      $$;

      CREATE OR REPLACE FUNCTION public.execute_sql_query(query TEXT)
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result JSONB;
      BEGIN
        EXECUTE query INTO result;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
      END;
      $$;
    `;

    const { error } = await supabaseClient.rpc("pg_execute", { command: setupSql });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
