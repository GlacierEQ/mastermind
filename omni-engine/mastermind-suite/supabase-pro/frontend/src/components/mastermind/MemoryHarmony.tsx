import React from 'react';

export const MemoryHarmony: React.FC = () => {
  const systems = [
    { name: "Supermemory", type: "Master Repo", status: "SYNCED", color: "text-blue-400" },
    { name: "Mem0 AI", type: "Recursive Lock", status: "ACTIVE", color: "text-green-400" },
    { name: "Letta (MemGPT)", type: "Episodic Core", status: "EVOLVING", color: "text-purple-400" },
    { name: "Neo4j Graph", type: "Relationship", status: "MAPPED", color: "text-yellow-400" }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.5em] mb-2">Memory Harmony Tier 7</h2>
          <div className="text-2xl font-black text-white italic tracking-tighter uppercase">MULTI-MEMORY <span className="text-blue-500">UNIFICATION</span></div>
        </div>
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
          <span className="text-2xl opacity-50">🌀</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {systems.map(s => (
          <div key={s.name} className="p-4 bg-black/60 border border-zinc-800 rounded-2xl group hover:border-white/20 transition-all">
            <div className="text-[8px] text-zinc-600 uppercase font-bold mb-1">{s.type}</div>
            <div className="text-xs font-black text-white uppercase mb-2">{s.name}</div>
            <div className={`text-[9px] font-black ${s.color} animate-pulse`}>{s.status}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 p-4 bg-blue-900/10 border border-blue-500/20 rounded-2xl flex justify-between items-center">
        <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest italic">Unified Context Reach</span>
        <span className="text-xl font-black text-white tabular-nums tracking-tighter italic">INFINITE_∞</span>
      </div>
    </div>
  );
};
