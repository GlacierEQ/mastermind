import React, { useState } from 'react';

export const TomahawkPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockResults = [
    { id: 'tmhk_1', name: 'merged_8.pdf', storage: 'Google Drive', type: 'Evidence' },
    { id: 'tmhk_2', name: 'bias_analysis.md', storage: 'GitHub', type: 'Analysis' },
    { id: 'tmhk_3', name: 'alienation_log', storage: 'Notion', type: 'Evidence Log' }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-orange-500/30 rounded-[2.5rem] shadow-[0_0_40px_rgba(249,115,22,0.1)] relative overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-[9px] text-orange-500 uppercase font-black tracking-[0.5em] mb-2">Multi-Cloud Filesystem</h2>
          <div className="text-2xl font-black text-white italic tracking-tighter">TOMAHAWK_API <span className="text-orange-500">v1.0</span></div>
        </div>
        <div className="w-12 h-12 bg-orange-600/10 border border-orange-500/30 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-2xl text-orange-500">🔥</span>
        </div>
      </div>

      <div className="relative mb-6">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH CROSS-CLOUD EVIDENCE..."
          className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-orange-400 placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 opacity-50 font-bold text-[10px]">SEARCH</div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {mockResults.map(res => (
          <div key={res.id} className="p-3 bg-black/60 border border-zinc-800 rounded-xl hover:border-orange-500/30 transition-all cursor-pointer group">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">📄</span>
                <div>
                  <div className="text-xs font-bold text-zinc-200">{res.name}</div>
                  <div className="text-[9px] text-zinc-600 font-mono uppercase">{res.storage} • {res.type}</div>
                </div>
              </div>
              <div className="text-[10px] text-orange-500/50 group-hover:text-orange-500 transition-colors">>> OPEN</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-orange-600/10 border border-orange-500/30 py-3 rounded-xl text-[10px] font-black uppercase text-orange-400 hover:bg-orange-600/20 transition-all">
          Trigger Full Sync
        </button>
        <button className="flex-1 bg-zinc-800 border border-zinc-700 py-3 rounded-xl text-[10px] font-black uppercase text-zinc-400 hover:bg-zinc-700 transition-all">
          Upload Metadata
        </button>
      </div>
    </div>
  );
};
