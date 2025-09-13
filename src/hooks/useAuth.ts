import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserId } from './useUserId';
import { useToast } from './use-toast';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useUserId();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const initAuth = async () => {
      try {
        // Check if user profile exists
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                user_id: userId,
                display_name: 'Relay User',
              }
            ]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast({
              title: 'Errore',
              description: 'Impossibile creare il profilo utente',
              variant: 'destructive',
            });
          } else {
            setIsAuthenticated(true);
            toast({
              title: 'Benvenuto!',
              description: 'Profilo creato con successo',
            });
          }
        } else if (!error) {
          setIsAuthenticated(true);
        } else {
          console.error('Error checking profile:', error);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [userId, toast]);

  const signOut = async () => {
    setIsAuthenticated(false);
    // We don't actually sign out from Supabase auth since we're using local IDs
    // Just reset the local state
  };

  return {
    isAuthenticated,
    isLoading,
    signOut,
    userId,
  };
};