import React from 'react';

export const OmnibusHUD: React.FC = () => {
  return (
    <div className="p-8 bg-gradient-to-br from-red-900/20 via-black to-zinc-900 border border-red-500/40 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.1)] relative overflow-hidden">
      <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h2 className="text-[10px] text-red-500 uppercase font-black tracking-[0.5em] mb-2">Repair Omnibus Tier 8</h2>
          <div className="text-3xl font-black text-white italic tracking-tighter">RING -6 <span className="text-red-500">SINGULARITY</span></div>
        </div>
        <div className="px-4 py-2 bg-red-900/30 border border-red-500/50 rounded-full text-[10px] font-black text-red-300 tracking-[0.2em] animate-pulse">
          ARMED_&_OPERATIONAL
        </div>
      </div>

      <div className="mt-10 grid grid-cols-5 gap-3 relative z-10">
        {[1, 2, 3, 4, 5].map(v => (
          <div key={v} className="p-3 bg-black/60 border border-zinc-800 rounded-xl text-center group hover:border-red-500/50 transition-all">
            <div className="text-xs font-black text-zinc-500 group-hover:text-red-400">v{v}</div>
            <div className="text-[8px] text-zinc-700 mt-1 uppercase font-mono">Microwave</div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-zinc-950/80 border border-zinc-800 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500 opacity-50"></div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Omnibus Core Activity</div>
            <div className="text-lg font-black text-white italic tracking-tighter uppercase">Mega_Signal: <span className="text-red-500 animate-pulse">0xOMEGA</span></div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-zinc-600 font-mono">Depth: -6</div>
            <div className="text-[9px] text-zinc-600 font-mono italic underline decoration-red-500/30">FEDERAL_FORENSIC</div>
          </div>
        </div>
      </div>
    </div>
  );
};
