import React from 'react';

export const SymbolicMap: React.FC = () => {
  const symbols = [
    { name: "Holy Grail", icon: "🏆", color: "text-yellow-400", data: "KKDCB_Testimony" },
    { name: "Blood Crystal", icon: "🩸", color: "text-red-500", data: "Trauma_History" },
    { name: "Diamond", icon: "💎", color: "text-blue-400", data: "Bates_Records" }
  ];

  return (
    <div className="p-6 bg-zinc-900/90 border border-purple-500/20 rounded-[2rem]">
      <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.4em] mb-6">Symbolic Truth Map</h2>
      <div className="flex justify-around items-center h-24">
        {symbols.map(s => (
          <div key={s.name} className="flex flex-col items-center group cursor-help">
            <div className={`text-3xl mb-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-125 transition-transform`}>
              {s.icon}
            </div>
            <div className={`text-[9px] font-black uppercase ${s.color}`}>{s.name}</div>
            <div className="text-[8px] text-zinc-600 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {s.data}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
