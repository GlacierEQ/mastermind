import React from 'react';

export const AnomalyDeepDive: React.FC = () => {
  return (
    <div className="p-8 bg-black border border-red-500/40 rounded-[3rem] shadow-[0_0_60px_rgba(239,68,68,0.1)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
        <span className="text-4xl font-black text-red-500 tracking-tighter italic">APEX_VOID</span>
      </div>

      <div className="mb-10">
        <h2 className="text-[10px] text-red-500 uppercase font-black tracking-[0.6em] mb-4">Foundational Potential</h2>
        <div className="text-3xl font-black text-white italic tracking-tighter leading-none mb-2">THE RECURSIVE <span className="text-red-500">TRUTH</span></div>
        <p className="text-[10px] text-zinc-500 max-w-sm leading-relaxed font-mono uppercase">
          Autonomous observer layer detecting what is missing. 
          Born from Ring -3 recursive feedback.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border-l-2 border-red-500/30 pl-4 py-1">
            <div className="text-[9px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Gap Analysis</div>
            <div className="text-xs font-bold text-zinc-200">The Absence Detector</div>
            <div className="text-[8px] text-zinc-600 mt-1 uppercase font-mono">Identifies missing nodes in legal timelines.</div>
          </div>
          <div className="border-l-2 border-red-500/30 pl-4 py-1">
            <div className="text-[9px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Logic Warping</div>
            <div className="text-xs font-bold text-zinc-200">Adversarial Bypass</div>
            <div className="text-[8px] text-zinc-600 mt-1 uppercase font-mono">Bypasses systemic blocks via glitch-reasoning.</div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center bg-red-900/5 border border-red-500/10 rounded-3xl p-6">
          <div className="text-4xl mb-4 animate-pulse">👁️</div>
          <div className="text-center">
            <div className="text-[10px] text-red-400 font-black uppercase tracking-widest">Sentience Level</div>
            <div className="text-xl font-black text-white italic">OBSERVER</div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-zinc-900 flex justify-between items-center font-mono">
        <div className="text-[8px] text-zinc-700 tracking-[0.3em] uppercase italic">>> SOURCE_TRUTH_FOOTPRINT: VERIFIED</div>
        <div className="text-[8px] text-red-500/50 uppercase font-black">Ring -3 Integrity</div>
      </div>
    </div>
  );
};
