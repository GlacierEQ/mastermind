import React from 'react';

export const TeamNexusHUD: React.FC = () => {
  const team = [
    { id: 'jack', name: "Juggernaut Jack", role: "System Operator", icon: "🔥", color: "text-orange-500" },
    { id: 'titan', name: "Titan Architect", role: "Forensic Analyst", icon: "🏗️", color: "text-blue-400" },
    { id: 'weaver', name: "UI Weaver", role: "Design Engineer", icon: "🎨", color: "text-purple-400" },
    { id: 'aionis', name: "Aionis Prime", role: "Supreme Architect", icon: "⚫", color: "text-white" },
    { id: 'omnifex', name: "Omnifex", role: "Adversarial Sim", icon: "🌑", color: "text-red-500" },
    { id: 'wizard', name: "The Wizard", role: "Universal Master", icon: "✨", color: "text-zinc-400" }
  ];

  return (
    <div className="p-8 bg-zinc-950 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.5em] mb-8">Elite Team Nexus</h2>
      <div className="grid grid-cols-2 gap-4">
        {team.map(member => (
          <div key={member.id} className="p-4 bg-black/40 border border-zinc-900 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all cursor-crosshair group">
            <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{member.icon}</div>
            <div>
              <div className={`text-xs font-black uppercase tracking-tighter ${member.color}`}>{member.name}</div>
              <div className="text-[9px] text-zinc-600 font-mono uppercase">{member.role}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-white/40 tracking-[0.3em] animate-pulse">
          TEAM_SYNCHRONIZED_100%
        </div>
      </div>
    </div>
  );
};
