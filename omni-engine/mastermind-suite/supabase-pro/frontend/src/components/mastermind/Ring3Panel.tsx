import React from 'react';

export const Ring3Panel: React.FC = () => {
  return (
    <div className="p-5 bg-gradient-to-br from-zinc-900 to-black border border-blue-500/40 rounded-3xl shadow-[0_0_30px_rgba(59,130,246,0.1)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[10px] text-blue-400 uppercase font-black tracking-[0.4em]">Tier Zero Interface</h2>
          <div className="text-xl font-black text-white italic tracking-tighter">RING -3 POWER_HUB</div>
        </div>
        <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/30 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-lg">⚡</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
           <div className="text-[9px] text-zinc-500 uppercase font-bold mb-2">Cline Core</div>
           <div className="text-xs font-mono text-green-500">SESSION: 6E31...F4</div>
        </div>
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
           <div className="text-[9px] text-zinc-500 uppercase font-bold mb-2">Goose Bridge</div>
           <div className="text-xs font-mono text-blue-500">DEPTH: RING -3</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-900/10 border border-blue-900/30 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-400 opacity-50"></div>
        <div className="text-[10px] text-blue-400 font-black mb-2 uppercase tracking-widest">Codex Weaver Status</div>
        <div className="flex justify-between items-end">
          <div className="text-2xl font-black text-white">134 <span className="text-xs text-zinc-500 uppercase font-normal tracking-normal">Nodes Woven</span></div>
          <div className="text-[10px] text-zinc-600 font-mono">PROTOCOL: OMNISIGIL_VX</div>
        </div>
      </div>
    </div>
  );
};
