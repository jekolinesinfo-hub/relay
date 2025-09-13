import { useState, useEffect } from 'react';

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
    // Carica il nome dal localStorage
    const savedName = localStorage.getItem('whatsapp-clone-user-name');
    if (savedName) {
      setProfile(prev => ({ ...prev, name: savedName }));
    } else {
      // Nome predefinito basato sull'ID
      setProfile(prev => ({ ...prev, name: `User${userId.slice(-4)}` }));
    }
  }, [userId]);

  const updateName = (newName: string) => {
    const trimmedName = newName.trim();
    if (trimmedName.length > 0) {
      localStorage.setItem('whatsapp-clone-user-name', trimmedName);
      setProfile(prev => ({ ...prev, name: trimmedName }));
      return true;
    }
    return false;
  };

  return {
    profile,
    updateName
  };
};