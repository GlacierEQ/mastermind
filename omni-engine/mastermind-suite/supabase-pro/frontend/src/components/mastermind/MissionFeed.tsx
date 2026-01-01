import React from 'react';
import { useNexus } from '../../context/NexusContext';

export const MissionFeed: React.FC = () => {
  const { missions } = useNexus();

  return (
    <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-[2rem] h-[755px] flex flex-col shadow-2xl backdrop-blur-xl">
      <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em] mb-6 flex justify-between">
        Live Mission Feed
        <span className="animate-pulse">_</span>
      </h2>
      <div className="flex-1 overflow-y-auto space-y-6 text-[11px] font-mono pr-2 custom-scrollbar scroll-smooth">
        {missions.map((mission) => (
          <div key={mission.id} className={`border-l-2 pl-4 py-1 transition-all duration-500 ${
            mission.status === 'PENDING' ? 'border-zinc-700 opacity-50' : 
            mission.type === 'TITAN_SCAN' ? 'border-blue-500' :
            mission.type === 'MICROWAVE_NUKE' ? 'border-red-500' : 'border-purple-500'
          }`}>
            <div className={`font-black mb-1 ${
              mission.status === 'PENDING' ? 'text-zinc-500' :
              mission.type === 'TITAN_SCAN' ? 'text-blue-500' :
              mission.type === 'MICROWAVE_NUKE' ? 'text-red-500' : 'text-purple-500'
            }`}>
              [{mission.time}] {mission.type}
            </div>
            <div className="text-zinc-400 italic leading-relaxed">
              {mission.detail}
            </div>
          </div>
        ))}
        <div className="animate-pulse text-blue-500 font-black mt-8 tracking-widest text-center border border-blue-500/20 py-4 rounded-xl">
          _ AWAITING COMMAND
        </div>
      </div>
    </div>
  );
};
