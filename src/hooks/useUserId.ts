import { useState, useEffect } from 'react';

// Genera un ID utente univoco di 8 caratteri
const generateUserId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useUserId = () => {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Controlla se l'ID esiste già nel localStorage
    let storedId = localStorage.getItem('whatsapp-clone-user-id');
    
    if (!storedId) {
      // Genera nuovo ID se non esiste
      storedId = generateUserId();
      localStorage.setItem('whatsapp-clone-user-id', storedId);
    }
    
    setUserId(storedId);
  }, []);

  const regenerateId = () => {
    const newId = generateUserId();
    localStorage.setItem('whatsapp-clone-user-id', newId);
    setUserId(newId);
  };

  return { userId, regenerateId };
};