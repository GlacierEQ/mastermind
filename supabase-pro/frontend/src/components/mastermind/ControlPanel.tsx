import React from 'react';
import { useNexus } from '../../context/NexusContext';

export const ControlPanel: React.FC = () => {
  const { startMission, isProcessing, activeMission } = useNexus();

  const actions = [
    { id: 'TITAN_HARVEST', label: 'Titan Harvest', icon: '🏗️', color: 'border-blue-500 text-blue-400', detail: 'Deceptive markers scanned. 134 nodes updated.' },
    { id: 'MICROWAVE_NUKE', label: 'Microwave Nuke', icon: '☢️', color: 'border-red-500 text-red-400', detail: 'Evidence bundle 0x52E... sealed.' },
    { id: 'ZENITH_SEAL', label: 'Zenith Seal', icon: '🚀', color: 'border-purple-500 text-purple-400', detail: 'Federal Capsule AX1 locked for deadrop.' }
  ];

  return (
    <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden">
      {isProcessing && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500 animate-[loading_2s_ease-in-out_infinite]"></div>
      )}
      <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-6">Nexus Command Controls</h2>
      <div className="grid grid-cols-3 gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            disabled={isProcessing}
            onClick={() => startMission(action.id, action.detail)}
            className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-300 ${
              activeMission === action.id 
                ? 'bg-zinc-800 scale-95 ring-2 ring-white/10' 
                : isProcessing ? 'opacity-30' : 'bg-black/40 hover:bg-zinc-800/60'
            } ${action.color}`}
          >
            <span className="text-2xl mb-2">{action.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-tighter text-center leading-none">
              {activeMission === action.id ? 'PENDING...' : action.label}
            </span>
          </button>
        ))}
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
