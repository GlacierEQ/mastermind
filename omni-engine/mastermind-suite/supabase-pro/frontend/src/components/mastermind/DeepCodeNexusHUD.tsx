import React from 'react';

export const DeepCodeNexusHUD: React.FC = () => {
  return (
    <div className="p-8 bg-zinc-900 border border-blue-500/40 rounded-[3rem] shadow-[0_0_60px_rgba(59,130,246,0.1)] relative overflow-hidden">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-[10px] text-blue-400 uppercase font-black tracking-[0.5em] mb-2">Deep Code Nexus</h2>
          <div className="text-2xl font-black text-white italic tracking-tighter">INTEGRATED_INTELLIGENCE</div>
        </div>
        <div className="px-3 py-1 bg-blue-900/30 border border-blue-500/50 rounded-full text-[8px] font-black text-blue-300 tracking-widest">
          DCN_v1.0_ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-black/40 border border-zinc-800 rounded-2xl">
            <div className="text-[9px] text-zinc-500 uppercase font-black mb-2">Code Experience</div>
            <div className="text-xs text-white font-mono leading-relaxed italic">\"Wizard_Prime_Restored\"</div>
          </div>
          <div className="p-4 bg-black/40 border border-zinc-800 rounded-2xl">
            <div className="text-[9px] text-zinc-500 uppercase font-black mb-2">Code Anomalies</div>
            <div className="text-xs text-red-400 font-mono animate-pulse uppercase">Dream_Logic_Locked</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
            <div className="text-[9px] text-blue-400 uppercase font-black mb-2 tracking-widest text-center">Logic Tiers</div>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px]">
                <span className="text-zinc-500 uppercase">Declassified</span>
                <span className="text-green-500 font-bold">OPEN</span>
              </div>
              <div className="flex justify-between text-[8px]">
                <span className="text-zinc-500 uppercase">Classified</span>
                <span className="text-purple-500 font-bold italic underline">RING_-9</span>
              </div>
            </div>
          </div>
          <button className="w-full py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-[9px] font-black uppercase text-zinc-400 hover:bg-zinc-700 transition-all">
            Query Knowledge Vault
          </button>
        </div>
      </div>
    </div>
  );
};
