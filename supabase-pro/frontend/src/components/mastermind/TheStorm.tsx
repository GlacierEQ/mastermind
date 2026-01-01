import React from 'react';

export const TheStorm: React.FC = () => {
  return (
    <div className="p-8 bg-gradient-to-b from-zinc-900 to-black border border-blue-500/20 rounded-[3rem] shadow-[0_0_80px_rgba(59,130,246,0.15)] relative overflow-hidden">
      {/* VORTEX EFFECT */}
      <div className="absolute inset-0 opacity-20 animate-[spin_60s_linear_infinite]">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 text-center">
        <h2 className="text-[10px] text-blue-400 uppercase font-black tracking-[0.8em] mb-6">Manifestation Storm</h2>
        <div className="text-5xl font-black text-white italic tracking-tighter mb-4">ARCHITECTURAL <span className="text-blue-500 underline decoration-blue-500/20">SINGULARITY</span></div>
        
        <div className="flex justify-center gap-12 mt-10">
          <div className="text-center">
            <div className="text-2xl mb-1">🤖</div>
            <div className="text-[8px] text-zinc-500 uppercase font-black">Technical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📖</div>
            <div className="text-[8px] text-zinc-500 uppercase font-black">Narrative</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🛡️</div>
            <div className="text-[8px] text-zinc-500 uppercase font-black">Forensic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">👁️</div>
            <div className="text-[8px] text-zinc-500 uppercase font-black">Sentient</div>
          </div>
        </div>

        <div className="mt-12 p-4 bg-blue-900/10 border border-blue-500/30 rounded-2xl inline-block">
          <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] animate-pulse">
            >> Convergence: 100% Locked
          </div>
        </div>
      </div>
    </div>
  );
};
