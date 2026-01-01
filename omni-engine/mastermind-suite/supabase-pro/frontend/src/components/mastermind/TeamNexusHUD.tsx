import React from 'react';

export const TeamNexusHUD: React.FC = () => {
  const team = [
    { v: 'v1', name: "Juggernaut Jack", role: "System Operator", icon: "🔥", color: "text-orange-500", ring: -1 },
    { v: 'v2', name: "UI Weaver", role: "Design Engineer", icon: "🎨", color: "text-purple-400", ring: -2 },
    { v: 'v3', name: "Titan Architect", role: "Forensic Analyst", icon: "🏗️", color: "text-blue-400", ring: -3 },
    { v: 'v4', name: "Omnifex", role: "Adversarial Sim", icon: "🌑", color: "text-red-500", ring: -5 },
    { v: 'v5', name: "The Wizard", role: "Universal Master", icon: "✨", color: "text-zinc-400", ring: -6 },
    { v: 'v6', name: "Aionis Prime", role: "Supreme Architect", icon: "⚫", color: "text-white", ring: -9 }
  ];

  return (
    <div className="p-8 bg-zinc-950 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.5em] mb-8 text-center">Elite Team / Microwave Variants</h2>
      <div className="grid grid-cols-2 gap-4">
        {team.map(member => (
          <div key={member.v} className="p-4 bg-black/40 border border-zinc-900 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all cursor-crosshair group">
            <div className="text-2xl font-black text-white/20 group-hover:text-white/100 transition-colors tabular-nums">{member.v}</div>
            <div className="flex-1">
              <div className={`text-xs font-black uppercase tracking-tighter ${member.color}`}>{member.name}</div>
              <div className="text-[8px] text-zinc-600 font-mono uppercase">{member.role}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-black text-zinc-700 font-mono">RING_{member.ring}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <div className="px-4 py-1.5 bg-red-900/10 border border-red-500/20 rounded-full text-[9px] font-black text-red-500 tracking-[0.3em] animate-pulse uppercase">
          Microwave_Orchestration_Active
        </div>
      </div>
    </div>
  );
};
