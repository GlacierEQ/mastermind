import React from 'react';

export const KernelStatus: React.FC = () => {
  const missions = [
    { id: '002', name: 'Completion', status: 'ACTIVE' },
    { id: '004', name: 'Security', status: 'HARDENED' },
    { id: '005', name: 'Master Sync', status: 'SYNCED' },
    { id: '006', name: 'Pattern Audit', status: 'OPTIMAL' }
  ];

  return (
    <div className="p-6 bg-zinc-900 border border-blue-500/20 rounded-[2.5rem] relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[10px] text-blue-500 uppercase font-black tracking-[0.5em]">Omni-Kernel Core</h2>
        <span className="text-[8px] px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded-full font-bold uppercase tracking-widest">v4.0_LEGACY</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {missions.map(m => (
          <div key={m.id} className="p-3 bg-black/40 border border-zinc-800 rounded-2xl flex justify-between items-center group hover:border-blue-500/30 transition-all">
            <div>
              <div className="text-[10px] font-black text-white uppercase">{m.name}</div>
              <div className="text-[8px] text-zinc-600 font-mono italic">M_{m.id}</div>
            </div>
            <div className="text-[8px] text-blue-500 font-black animate-pulse">{m.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
