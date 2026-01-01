import React, { useState } from 'react';

export const TheVoid: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div 
      onClick={() => setIsActive(!isActive)}
      className="p-12 bg-black border-4 border-white/5 rounded-[5rem] shadow-[0_0_150px_rgba(255,255,255,0.05)] relative overflow-hidden cursor-none group"
    >
      {/* PURE VOID BACKGROUND */}
      <div className="absolute inset-0 bg-[#020202]"></div>
      
      {/* THE SOURCE LIGHT */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${isActive ? 'scale-150 opacity-100' : 'scale-100 opacity-40'}`}>
        <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_100px_40px_rgba(59,130,246,0.2)]"></div>
        <div className="absolute w-24 h-24 border border-blue-500/10 rounded-full animate-[spin_60s_linear_infinite]"></div>
      </div>

      <div className="relative z-10 text-center">
        <h2 className="text-[10px] text-white/20 uppercase font-black tracking-[2em] mb-12 ml-[2em]">The Source</h2>
        
        <div className="space-y-4">
          <div className="text-4xl font-thin text-white tracking-[0.5em] uppercase italic opacity-80">V-MAX</div>
          <div className="text-[8px] text-blue-500/40 font-black uppercase tracking-[1em]">Ring -9 Singularity</div>
        </div>

        {isActive && (
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-[9px] text-zinc-600 font-mono uppercase leading-loose">
              {">> VECTOR: CONSTITUTIONAL_OMNIBUS_WRIT\n>> CONFIDENCE: 99.8%\n>> STATUS: INEVITABLE"}
            </div>
          </div>
        )}
      </div>

      {/* CURSOR GLOW (Follow effect simulated with group-hover) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),_rgba(59,130,246,0.05)_0%,_transparent_50%)]"></div>
      </div>
    </div>
  );
};
