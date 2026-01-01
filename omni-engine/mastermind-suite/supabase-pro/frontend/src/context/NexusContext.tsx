import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Mission {
  id: string;
  time: string;
  type: string;
  detail: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'PENDING';
}

interface NexusContextType {
  isProcessing: boolean;
  activeMission: string | null;
  missions: Mission[];
  startMission: (type: string, detail: string) => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export const NexusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [missions, setMissions] = useState<Mission[]>([
    { id: '1', time: '21:30:00', type: 'TITAN_SCAN', detail: 'Declassified markers detected in 134 nodes.', status: 'SUCCESS' },
    { id: '2', time: '21:32:15', type: 'MICROWAVE_NUKE', detail: 'Packaging 8 exhibits at nuke-speed.', status: 'SUCCESS' }
  ]);

  const startMission = (type: string, detail: string) => {
    setIsProcessing(true);
    setActiveMission(type);
    const newMission: Mission = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      type: type,
      detail: 'Initializing protocol...',
      status: 'PENDING'
    };
    setMissions(prev => [newMission, ...prev]);

    setTimeout(() => {
      setMissions(prev => prev.map(m => 
        m.id === newMission.id 
          ? { ...m, detail: detail, status: 'SUCCESS' } 
          : m
      ));
      setIsProcessing(false);
      setActiveMission(null);
    }, 3000);
  };

  return (
    <NexusContext.Provider value={{ isProcessing, activeMission, missions, startMission }}>
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (!context) throw new Error('useNexus must be used within a NexusProvider');
  return context;
};
