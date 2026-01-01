import React from 'react';

export const AnomalyMatrix: React.FC = () => {
  const anomalies = [
    { id: "GREMLIN_SHIELD", label: "Gremlin Shield", status: "STABLE", icon: "🛡️", color: "text-green-400" },
    { id: "PROCEDURAL_WARP", label: "Procedural Warp", status: "DISTORTED", icon: "🌀", color: "text-blue-400" },
    { id: "NARRATIVE_GLITCH", label: "Narrative Glitch", status: "LOCKED", icon: "🧶", color: "text-purple-400" },
    { id: "QUANTUM_TRACE", label: "Quantum Trace", status: "ACTIVE", icon: "🛰️", color: "text-yellow-400" }
  ];

  return (
    <div className="p-6 bg-black/60 border border-red-500/20 rounded-[2rem] shadow-[0_0_40px_rgba(239,68,68,0.05)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[10px] text-red-500 uppercase font-black tracking-[0.5em]">Tier Zero Anomaly</h2>
        <span className="text-[8px] px-2 py-0.5 bg-red-900/30 text-red-400 rounded-full font-black animate-pulse uppercase">G_L_I_T_C_H</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {anomalies.map(a => (
          <div key={a.id} className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl hover:border-red-500/30 transition-all group">
            <div className="flex items-center gap-3">
              <span className="text-xl group-hover:scale-110 transition-transform">{a.icon}</span>
              <div>
                <div className="text-[9px] font-black uppercase text-zinc-400">{a.label}</div>
                <div className={`text-[8px] font-mono ${a.color}`}>{a.status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
