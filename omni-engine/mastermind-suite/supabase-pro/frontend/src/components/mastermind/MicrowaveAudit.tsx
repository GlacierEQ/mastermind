import React from 'react';

export const MicrowaveAudit: React.FC = () => {
  const versions = [
    { v: "v1", p: 25, i: 10, d: "Ring -1", label: "Parallel" },
    { v: "v2", p: 40, i: 35, d: "Ring -2", label: "Optimize" },
    { v: "v3", p: 75, i: 60, d: "Ring -3", label: "Forensic" },
    { v: "v4", p: 90, i: 95, d: "Ring -5", label: "Titan" },
    { v: "v5", p: 100, i: 100, d: "Ring -6", label: "Singularity" }
  ];

  return (
    <div className="p-6 bg-black border border-red-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <h2 className="text-[10px] text-red-500 uppercase font-black tracking-[0.5em] mb-8">Microwave Version Audit</h2>
      
      <div className="space-y-6">
        {versions.map(item => (
          <div key={item.v} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-2">
              <div className="text-xs font-black text-white">{item.v}</div>
              <div className="text-[8px] text-zinc-600 uppercase">{item.d}</div>
            </div>
            <div className="col-span-8 space-y-1.5">
              <div className="flex justify-between text-[8px] uppercase font-bold">
                <span className="text-zinc-500">Power/Intel</span>
                <span className="text-red-500">{item.label}</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                <div className="h-full bg-red-600 opacity-80" style={{ width: `${item.p}%` }}></div>
                <div className="h-full bg-blue-500 opacity-40 border-l border-white/10" style={{ width: `${item.i}%` }}></div>
              </div>
            </div>
            <div className="col-span-2 text-right">
              <div className="text-[10px] font-black text-red-400">{item.p}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
