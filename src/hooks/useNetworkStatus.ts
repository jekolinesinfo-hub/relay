import { useState, useEffect } from 'react';

export type NetworkType = 'bluetooth' | 'wifi-direct' | 'mobile-data' | 'wifi' | 'offline';

export interface NetworkStatus {
  type: NetworkType;
  available: boolean;
  strength?: number; // 0-100
  name?: string;
}

export const useNetworkStatus = () => {
  const [networks, setNetworks] = useState<Record<NetworkType, NetworkStatus>>({
    'bluetooth': { type: 'bluetooth', available: true, strength: 85, name: 'Bluetooth' },
    'wifi-direct': { type: 'wifi-direct', available: true, strength: 70, name: 'WiFi Direct' },
    'wifi': { type: 'wifi', available: true, strength: 95, name: 'WiFi Casa' },
    'mobile-data': { type: 'mobile-data', available: true, strength: 60, name: '4G TIM' },
    'offline': { type: 'offline', available: false, strength: 0, name: 'Offline' }
  });

  const [activeNetwork, setActiveNetwork] = useState<NetworkType>('bluetooth');

  // Simula cambiamenti di rete
  useEffect(() => {
    const interval = setInterval(() => {
      // Simula cambiamenti casuali nella forza del segnale
      setNetworks(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const networkKey = key as NetworkType;
          if (networkKey !== 'offline' && updated[networkKey].available) {
            updated[networkKey].strength = Math.max(10, 
              Math.min(100, (updated[networkKey].strength || 50) + (Math.random() - 0.5) * 20)
            );
          }
        });
        return updated;
      });

      // Simula cambio di rete automatico per priorità
      setNetworks(prev => {
        const available = Object.values(prev).filter(n => n.available && n.type !== 'offline');
        if (available.length > 0) {
          // Priorità: bluetooth > wifi-direct > wifi > mobile-data
          const priority: NetworkType[] = ['bluetooth', 'wifi-direct', 'wifi', 'mobile-data'];
          for (const networkType of priority) {
            if (prev[networkType].available && prev[networkType].strength! > 30) {
              setActiveNetwork(networkType);
              break;
            }
          }
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getNetworkIcon = (type: NetworkType) => {
    switch (type) {
      case 'bluetooth': return '📶';
      case 'wifi-direct': return '📡';
      case 'wifi': return '📶';
      case 'mobile-data': return '📱';
      case 'offline': return '❌';
    }
  };

  const getNetworkLabel = (type: NetworkType) => {
    switch (type) {
      case 'bluetooth': return 'Bluetooth';
      case 'wifi-direct': return 'WiFi Direct';
      case 'wifi': return 'WiFi';
      case 'mobile-data': return 'Rete Mobile';
      case 'offline': return 'Offline';
    }
  };

  const toggleNetwork = (type: NetworkType) => {
    if (type === 'offline') return;
    
    setNetworks(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        available: !prev[type].available
      }
    }));
  };

  return {
    networks,
    activeNetwork,
    getNetworkIcon,
    getNetworkLabel,
    toggleNetwork,
    setActiveNetwork
  };
};