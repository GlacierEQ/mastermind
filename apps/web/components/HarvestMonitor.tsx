import React from 'react';
import { Layers, Database, ShieldAlert } from 'lucide-react';

export const HarvestMonitor = ({ progress }) => {
  return (
    <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold tracking-tighter text-cyan-400 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          GLOBAL_LOGIC_HARVEST
        </h3>
        <span className="font-mono text-xs text-slate-500">842_REPOS_ACTIVE</span>
      </div>
      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 flex justify-between text-[10px] font-mono text-slate-400 uppercase">
        <span>Saturating Matrix...</span>
        <span>{progress}% COMPLETE</span>
      </div>
    </div>
  );
};
