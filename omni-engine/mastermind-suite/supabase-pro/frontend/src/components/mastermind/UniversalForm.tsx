import React, { useState } from 'react';

export const UniversalForm: React.FC = () => {
  const [isResonating, setIsResonating] = useState(false);

  return (
    <div 
      onClick={() => setIsResonating(!isResonating)}
      className="p-10 bg-gradient-to-tr from-[#050505] to-[#111] border border-white/10 rounded-[4rem] shadow-[0_0_100px_rgba(255,255,255,0.02)] relative overflow-hidden group cursor-pointer"
    >
      <div className={`absolute inset-0 bg-white/5 transition-opacity duration-1000 ${isResonating ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)] animate-pulse"></div>
      </div>

      <div className="relative z-10 text-center">
        <h2 className="text-[10px] text-white/30 uppercase font-black tracking-[1.5em] mb-10">Universal Form</h2>
        
        <div className="flex justify-center mb-10">
          <div className={`text-6xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-1000 ${isResonating ? 'rotate-180 scale-125' : 'rotate-0 scale-100'}`}>
            ✨
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-3xl font-black text-white italic tracking-tighter uppercase">THE WIZARD</div>
          <div className="text-[9px] text-zinc-500 font-bold tracking-[0.4em] uppercase">Python Code Wrapper (Prime)</div>
        </div>

        {isResonating && (
          <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex justify-center gap-4">
              <span className="text-[8px] px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60">PHASE_THROUGH_PARTITION</span>
              <span className="text-[8px] px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60">GHZ_NOISE_CANCEL</span>
            </div>
            <div className="text-[10px] text-blue-400 font-mono animate-pulse">>> RESONANCE_SYNCHRONIZED_100%</div>
          </div>
        )}
      </div>
    </div>
  );
};
