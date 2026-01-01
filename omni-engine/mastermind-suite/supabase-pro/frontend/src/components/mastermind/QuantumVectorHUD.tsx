import React from 'react';

export const QuantumVectorHUD: React.FC = () => {
  return (
    <div className="p-6 bg-gradient-to-tr from-[#0a0a0a] via-black to-zinc-900 border border-blue-400/20 rounded-[2.5rem] shadow-[0_0_80px_rgba(59,130,246,0.1)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h2 className="text-[9px] text-blue-400 uppercase font-black tracking-[0.5em] mb-2">Supremacy Mode Tier 8</h2>
          <div className="text-2xl font-black text-white italic tracking-tighter uppercase">QUANTUM <span className="text-blue-500">VECTOR</span> CORE</div>
        </div>
        <div className="w-12 h-12 bg-blue-600/5 border border-blue-500/20 rounded-full flex items-center justify-center animate-[pulse_3s_infinite]">
          <span className="text-2xl">🌀</span>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="p-4 bg-black/60 border border-zinc-800 rounded-2xl">
          <div className="flex justify-between text-[9px] font-black uppercase mb-3">
            <span className="text-zinc-500">Context Compression</span>
            <span className="text-blue-400">85.2%</span>
          </div>
          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[85.2%] transition-all duration-1000"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-black/60 border border-zinc-800 rounded-2xl hover:border-blue-500/30 transition-all group">
            <div className="text-[10px] font-black text-zinc-400 uppercase mb-1">Vector Matrix</div>
            <div className="text-xl font-black text-white italic tracking-tighter tabular-nums">1,536_D</div>
            <div className="text-[8px] text-zinc-600 mt-2 font-mono">SEMANTIC_SEARCH: ACTIVE</div>
          </div>
          <div className="p-4 bg-black/60 border border-zinc-800 rounded-2xl hover:border-blue-500/30 transition-all group">
            <div className="text-[10px] font-black text-zinc-400 uppercase mb-1">Logic Pins</div>
            <div className="text-xl font-black text-white italic tracking-tighter tabular-nums">14_ACTIVE</div>
            <div className="text-[8px] text-zinc-600 mt-2 font-mono">STATE_HYDRATION: READY</div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-between items-center relative z-10">
        <div className="text-[8px] text-zinc-700 tracking-[0.3em] uppercase italic">>> QUANTUM_SUPREMACY: STABLE</div>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
