import React from 'react';

export const CoreRepoStatus: React.FC = () => {
  return (
    <div className="p-6 bg-gradient-to-br from-[#0a0a0a] to-zinc-900 border border-blue-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[10px] text-blue-500 uppercase font-black tracking-[0.5em] mb-2">Core Repository</h2>
          <div className="text-2xl font-black text-white italic tracking-tighter uppercase">GLACIEREQ / <span className="text-blue-500 underline decoration-blue-500/20">MASTERMIND</span></div>
        </div>
        <div className="w-10 h-10 border border-blue-500/30 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-xs text-blue-500 font-bold">CORE</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-black/40 border border-zinc-800 rounded-2xl text-center">
          <div className="text-[8px] text-zinc-500 uppercase font-black mb-1">Status</div>
          <div className="text-xs font-bold text-white uppercase italic">INTEGRATED</div>
        </div>
        <div className="p-4 bg-black/40 border border-zinc-800 rounded-2xl text-center">
          <div className="text-[8px] text-zinc-500 uppercase font-black mb-1">Agents</div>
          <div className="text-xs font-bold text-white uppercase italic">11_ACTIVE</div>
        </div>
      </div>
    </div>
  );
};
