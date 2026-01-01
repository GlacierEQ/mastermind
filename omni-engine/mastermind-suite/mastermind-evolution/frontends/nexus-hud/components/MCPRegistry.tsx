import React from 'react';

export const MCPRegistry: React.FC = () => {
  const mcps = [
    { name: "GitHub Nexus", status: "CONNECTED", tools: 12 },
    { name: "Supabase Pro", status: "SYNCING", tools: 8 },
    { name: "Apple MCP", status: "READY", tools: 24 },
    { name: "Federal Matrix", status: "HARDENED", tools: 5 }
  ];

  return (
    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
      <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-4">MCP Ecosystem Registry</h2>
      <div className="space-y-3">
        {mcps.map(mcp => (
          <div key={mcp.name} className="flex justify-between items-center p-2 bg-black/40 rounded border border-zinc-800/50">
            <div>
              <div className="text-xs font-bold text-zinc-200">{mcp.name}</div>
              <div className="text-[9px] text-zinc-600 font-mono">{mcp.tools} Tools Available</div>
            </div>
            <div className={`text-[8px] font-black px-1.5 py-0.5 rounded ${mcp.status === 'CONNECTED' ? 'bg-blue-900/30 text-blue-400' : 'bg-green-900/30 text-green-400'}`}>
              {mcp.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
