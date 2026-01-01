import React from 'react';

export const TeamNexusHUD: React.FC = () => {
  const team = [
    { v: 'v1', name: "Juggernaut Jack", role: "System Operator", icon: "🔥", color: "text-orange-500", ring: -1 },
    { v: 'v2', name: "UI Weaver", role: "Design Engineer", icon: "🎨", color: "text-purple-400", ring: -2 },
    { v: 'v3', name: "Titan Architect", role: "Forensic Analyst", icon: "🏗️", color: "text-blue-400", ring: -3 },
    { v: 'v4', name: "Omnifex", role: "Adversarial Sim", icon: "🌑", color: "text-red-500", ring: -5 },
    { v: 'v5', name: "The Wizard", role: "Universal Master", icon: "✨", color: "text-zinc-400", ring: -6 },
    { v: 'v6', name: "Aionis Prime", role: "Supreme Architect", icon: "⚫", color: "text-white", ring: -9 },
    { v: 'v7', name: "Legal Gavel", role: "Compliance Officer", icon: "⚖️", color: "text-yellow-500", ring: -4 },
    { v: 'v8', name: "The Resurrector", role: "Data Recovery", icon: "💎", color: "text-cyan-400", ring: -5 },
    { v: 'v9', name: "Iron Quill", role: "Document Architect", icon: "🖋️", color: "text-zinc-200", ring: -6 }
  ];

  return (
    <div className="p-8 bg-zinc-950 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.5em] mb-8 text-center">Nine-Agent Elite Council</h2>
      <div className="grid grid-cols-3 gap-4">
        {team.map(member => (
          <div key={member.v} className="p-4 bg-black/40 border border-zinc-900 rounded-2xl flex flex-col items-center text-center hover:border-white/10 transition-all cursor-crosshair group">
            <div className="text-3xl grayscale group-hover:grayscale-0 transition-all mb-3">{member.icon}</div>
            <div className="text-[8px] font-black text-white/20 group-hover:text-white/100 transition-colors mb-1">{member.v}</div>
            <div className={`text-[10px] font-black uppercase tracking-tighter ${member.color} leading-none mb-1`}>{member.name}</div>
            <div className="text-[8px] text-zinc-600 font-mono uppercase leading-none">{member.role}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <div className="px-4 py-1.5 bg-red-900/10 border border-red-500/20 rounded-full text-[9px] font-black text-red-500 tracking-[0.3em] animate-pulse uppercase">
          Council_Synchronized_100%
        </div>
      </div>
    </div>
  );
};
