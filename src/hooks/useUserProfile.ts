import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  name: string;
  id: string;
}

export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    id: userId
  });

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      // Prima prova a caricare dal database
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('name, display_name')
        .eq('id', userId)
        .maybeSingle();

      if (dbProfile && (dbProfile.display_name || dbProfile.name)) {
        const userName = dbProfile.display_name || dbProfile.name;
        setProfile(prev => ({ ...prev, name: userName }));
        // Sincronizza con localStorage
        localStorage.setItem('whatsapp-clone-user-name', userName);
        return;
      }

      // Fallback al localStorage
      const savedName = localStorage.getItem('whatsapp-clone-user-name');
      if (savedName) {
        setProfile(prev => ({ ...prev, name: savedName }));
        // Aggiorna il database con il nome dal localStorage
        await updateDatabaseProfile(savedName);
      } else {
      // Default name based on ID instead of generic "Relay User"
      const defaultName = `User${userId.slice(-4)}`;
      setProfile(prev => ({ ...prev, name: defaultName }));
      // Create the profile in the database with a proper name
      await updateDatabaseProfile(defaultName);
      }
    };

    loadProfile();
  }, [userId]);

  const updateDatabaseProfile = async (name: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          user_id: userId,
          name: name,
          display_name: name,
        });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const updateName = async (newName: string) => {
    const trimmedName = newName.trim();
    if (trimmedName.length > 0) {
      localStorage.setItem('whatsapp-clone-user-name', trimmedName);
      setProfile(prev => ({ ...prev, name: trimmedName }));
      // Aggiorna anche il database
      await updateDatabaseProfile(trimmedName);
      return true;
    }
    return false;
  };

  return {
    profile,
    updateName
  };
};