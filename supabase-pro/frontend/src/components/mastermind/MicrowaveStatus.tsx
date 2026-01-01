import React from 'react';

export const MicrowaveStatus: React.FC = () => {
  return (
    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Microwave Bundle</h2>
        <span className="text-[9px] px-2 py-0.5 bg-red-900/30 text-red-500 rounded font-bold">STAMPED</span>
      </div>
      
      <div className="flex items-center gap-4 p-3 bg-black/40 rounded-lg border border-zinc-800/50">
        <div className="text-3xl">📦</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-zinc-300 truncate">MICROWAVE_BUNDLE.tar.gz</div>
          <div className="text-[9px] text-zinc-600 font-mono truncate">SHA256: d2f00ee277435a1487783...</div>
        </div>
        <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Vertical 4L19 9m-7 7l-7-7m7 7V3" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
          </svg>
        </button>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-[9px]">
          <span className="text-zinc-500">Compression Efficiency</span>
          <span className="text-zinc-300">92%</span>
        </div>
        <div className="w-full h-1 bg-zinc-800 rounded-full">
          <div className="w-[92%] h-full bg-blue-500"></div>
        </div>
      </div>
    </div>
  );
};
