// Modern notification sound generator using Web Audio API
export const playModernNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a more complex, modern notification sound
    const createTone = (frequency: number, startTime: number, duration: number, volume: number = 0.1) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Use a more modern waveform
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      // Create an envelope for more natural sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    
    // Modern notification sound sequence - ascending notes with harmonics
    createTone(523.25, now, 0.15, 0.08); // C5
    createTone(659.25, now + 0.08, 0.15, 0.1); // E5
    createTone(783.99, now + 0.16, 0.2, 0.12); // G5
    
    // Add subtle harmonics for richness
    createTone(1046.5, now + 0.05, 0.1, 0.03); // C6 harmonic
    createTone(1318.5, now + 0.13, 0.1, 0.03); // E6 harmonic
    
  } catch (error) {
    console.log('Web Audio not supported, falling back to data URI sound');
    // Fallback to a more modern data URI sound
    const audio = new Audio('data:audio/wav;base64,UklGRp4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXgBAAC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uFi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uEi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uL');
    audio.volume = 0.4;
    audio.play().catch(e => console.log('Could not play fallback sound:', e));
  }
};

// Alternative: WhatsApp-like notification sound
export const playWhatsAppStyleSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createBell = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      // Bell-like envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    
    // WhatsApp-style notification (two quick notes)
    createBell(800, now, 0.2);
    createBell(600, now + 0.1, 0.25);
    
  } catch (error) {
    // Fallback
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxEw4fH');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Could not play sound:', e));
  }
};