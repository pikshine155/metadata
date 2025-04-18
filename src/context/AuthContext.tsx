import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { checkActiveSession, setActiveSession, removeActiveSession } from '@/utils/supabaseUtils';
import { UserProfile } from '@/types/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  incrementCreditsUsed: () => Promise<boolean>;
  canGenerateMetadata: boolean;
  forceSignOut: (email: string) => Promise<void>;
  getRandomApiKey: () => string;
  apiKey: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [canGenerateMetadata, setCanGenerateMetadata] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const navigate = useNavigate();

  // Define the list of API keys
  const API_KEYS = [
    'AIzaSyDml9XSTLPg83r9LYJytVWzB225PGjjZms',
    'AIzaSyD6UM2-DYAcHWDk005-HAzBAFmZfus9fSA',
    'AIzaSyCPBg14R8PY7rh48ovIoKmpT3LHyOiPvLI',
    'AIzaSyCPBg14R8PY7rh48ovIoKmpT3LHyOiPvLI',
    'AIzaSyD6UM2-DYAcHWDk005-HAzBAFmZfus9fSA',
    'AIzaSyAIstbYpqJ09epoUw_Mf1IX3ilslqW7KKc',
    'AIzaSyA_ALrz_Dq_Ng3NcIbMB1hO52xEoVtLsSw',
    'AIzaSyAMiWClJZRIQFsPktNVXWKiKN-MSF4gQXY',
    'AIzaSyBt-xmLLYomUmnlTRE1-NNyh4dpUHaDDlU',
    'AIzaSyAGheV4z8nhuVtAIF9Skfg4xkVM1-ML638',
    'AIzaSyD6wzrV3TGP6H2F0zBouHr0j3rWtC0HJ1k',
    'AIzaSyAj5cj6uFO1lZqI6cPfc8s1nQFQs03PxAA',
    'AIzaSyD3q-TvESGAf0UngLyh-H7sbieh3kUxHiI'
  ];

  // Function to get a random API key
  const getRandomApiKey = (): string => {
    const randomIndex = Math.floor(Math.random() * API_KEYS.length);
    return API_KEYS[randomIndex];
  };

  const trackUserSession = async (user: User, sessionId: string) => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();
      
      await supabase.functions.invoke('track_user_session', {
        body: {
          user_id: user.id,
          ip_address: ip,
          user_agent: navigator.userAgent,
          session_id: sessionId,
        },
      });
    } catch (error) {
      console.error('Error tracking user session:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Don't fetch profile here to avoid race condition
        // Instead, defer with setTimeout
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    // Check for stored API key
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    // Track user session when logged in
    if (session?.user) {
      const sessionId = session.access_token.slice(-10) || Date.now().toString();
      trackUserSession(session.user, sessionId);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Check if user can generate metadata based on credits and premium status
    if (profile) {
      const canGenerate = profile.is_premium || profile.credits_used < 10;
      setCanGenerateMetadata(canGenerate);
    } else {
      setCanGenerateMetadata(false);
    }
  }, [profile]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Force sign out a user from any existing sessions
  const forceSignOut = async (email: string) => {
    try {
      // Use functions.invoke instead of rpc
      const { error } = await supabase.functions.invoke('remove_active_session_by_email', {
        body: { user_email: email }
      });
      
      if (error) {
        console.error('Error in force sign out:', error);
        throw error;
      }

      return;
    } catch (error) {
      console.error('Error in forceSignOut:', error);
      throw error;
    }
  };

  // Check if a user is already logged in elsewhere
  const checkUserActiveSession = async (email: string): Promise<boolean> => {
    return await checkActiveSession(email);
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if the user is already logged in elsewhere
      const isActiveSession = await checkUserActiveSession(email);
      if (isActiveSession) {
        const confirmForceLogout = window.confirm(
          'This account is already logged in on another device or browser. Would you like to force logout from the other session and continue?'
        );
        
        if (!confirmForceLogout) {
          toast.error('Login cancelled - account is already active elsewhere');
          return;
        }
        
        // User confirmed, force logout from other sessions
        await forceSignOut(email);
        toast.success('Previous session has been terminated');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Set the user as active
      if (data?.user) {
        const sessionId = data.session?.access_token.slice(-10) || Date.now().toString();
        await setActiveSession(data.user.id, email, sessionId);
        
        // Assign and save a random API key for the user
        const randomApiKey = getRandomApiKey();
        localStorage.setItem('gemini-api-key', randomApiKey);
        setApiKey(randomApiKey);
        
        toast.success(`API Key assigned: ${randomApiKey.substring(0, 10)}...`);
      }
      
      toast.success('Signed in successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Signed up successfully! Please check your email for verification.');
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Remove the user from active sessions before signing out
      if (user) {
        await removeActiveSession(user.id);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  const incrementCreditsUsed = async (): Promise<boolean> => {
    if (!user || !profile) return false;
    
    // Premium users don't consume credits
    if (profile.is_premium) return true;
    
    // Free users with 10 or more credits used can't generate more
    if (profile.credits_used >= 10) {
      toast.error('You have reached your free limit. Please upgrade to premium.');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits_used: profile.credits_used + 1 })
        .eq('id', user.id);

      if (error) throw error;
      
      // Update local state
      setProfile({
        ...profile,
        credits_used: profile.credits_used + 1
      });
      
      // Log the generation
      await supabase
        .from('image_metadata_generations')
        .insert({
          user_id: user.id,
          prompt: 'Image metadata generation'
        });
      
      return true;
    } catch (error) {
      console.error('Error incrementing credits:', error);
      toast.error('Failed to process your request. Please try again.');
      return false;
    }
  };

  // Add a heartbeat function to keep the session alive
  useEffect(() => {
    const updateSessionActivity = async () => {
      if (user && session) {
        const sessionId = session.access_token.slice(-10) || Date.now().toString();
        await setActiveSession(user.id, user.email || '', sessionId);
      }
    };

    // Update session activity every 5 minutes
    const intervalId = setInterval(updateSessionActivity, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [user, session]);

  // Listen for window close or tab close to remove the active session
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user) {
        await removeActiveSession(user.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    incrementCreditsUsed,
    canGenerateMetadata,
    forceSignOut,
    getRandomApiKey,
    apiKey
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
