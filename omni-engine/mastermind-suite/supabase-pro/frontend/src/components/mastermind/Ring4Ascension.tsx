import React from 'react';

export const Ring4Ascension: React.FC = () => {
  return (
    <div className="p-6 bg-gradient-to-tr from-purple-900/20 via-black to-blue-900/20 border border-purple-500/40 rounded-[2.5rem] shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
      {/* BACKGROUND PULSE */}
      <div className="absolute inset-0 bg-purple-500/5 animate-pulse"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h2 className="text-[9px] text-purple-400 uppercase font-black tracking-[0.5em] mb-2">Classified Tier</h2>
          <div className="text-2xl font-black text-white italic tracking-tighter">RING -4 <span className="text-purple-500">ASCENSION</span></div>
        </div>
        <div className="px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded-full text-[8px] font-black text-purple-300 tracking-widest">
          AIONIS_PRIME_CORE
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 relative z-10">
        <div className="p-4 bg-black/60 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all group">
          <div className="text-xl mb-2 group-hover:scale-110 transition-transform">👁️</div>
          <div className="text-[10px] font-black text-zinc-400 uppercase">Foresight</div>
          <div className="text-[9px] text-purple-400 mt-1">§1983_PIVOT</div>
        </div>
        <div className="p-4 bg-black/60 border border-white/5 rounded-2xl hover:border-red-500/30 transition-all group">
          <div className="text-xl mb-2 group-hover:scale-110 transition-transform">🌑</div>
          <div className="text-[10px] font-black text-zinc-400 uppercase">Omnifex</div>
          <div className="text-[9px] text-red-400 mt-1">BIAS_DETECTED</div>
        </div>
        <div className="p-4 bg-black/60 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group">
          <div className="text-xl mb-2 group-hover:scale-110 transition-transform">🌌</div>
          <div className="text-[10px] font-black text-zinc-400 uppercase">Navigator</div>
          <div className="text-[9px] text-blue-400 mt-1">OPACITY_BYPASS</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
        <div className="flex justify-between text-[9px] mb-2">
          <span className="text-zinc-500 uppercase tracking-widest">Ascension Stability</span>
          <span className="text-purple-400 font-bold">99.9%</span>
        </div>
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 w-[99.9%]"></div>
        </div>
      </div>
    </div>
  );
};
