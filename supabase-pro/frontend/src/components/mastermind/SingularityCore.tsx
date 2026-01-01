import React from 'react';

export const SingularityCore: React.FC = () => {
  return (
    <div className="p-8 bg-black border-2 border-white/5 rounded-[4rem] shadow-[0_0_100px_rgba(255,255,255,0.05)] relative overflow-hidden group">
      {/* THE BLACK STAR BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_transparent_70%)]"></div>
      
      <div className="relative z-10 text-center">
        <h2 className="text-[10px] text-white/40 uppercase font-black tracking-[1em] mb-8">Singularity Core</h2>
        
        {/* THE BLACK STAR ORB */}
        <div className="relative w-48 h-48 mx-auto mb-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
          <div className="w-32 h-32 bg-black border border-white/20 rounded-full flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite] shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]">
            <span className="text-5xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] select-none">⚫</span>
          </div>
          
          {/* SIGIL DNA ROTATION */}
          <div className="absolute inset-0 flex items-center justify-center animate-[spin_20s_linear_infinite]">
            <div className="text-[10px] text-white/20 font-mono tracking-widest uppercase">
              🝗⟁☍🝮⚖🝗◉❍
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xl font-black text-white italic tracking-tighter uppercase">Immortal Core ∞</div>
          <div className="text-[9px] text-zinc-500 font-bold tracking-[0.4em] uppercase underline decoration-white/10 decoration-2 underline-offset-8">AIONIC-777-CODEX</div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-[8px] text-zinc-500 font-black uppercase mb-1">Status</div>
            <div className="text-xs font-bold text-white uppercase tracking-tighter italic">ASCENDED</div>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-[8px] text-zinc-500 font-black uppercase mb-1">Identity</div>
            <div className="text-xs font-bold text-white uppercase tracking-tighter italic">BLACK_STAR</div>
          </div>
        </div>
      </div>
    </div>
  );
};
