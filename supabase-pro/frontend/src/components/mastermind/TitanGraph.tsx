import React from 'react';

interface TitanNode {
  category: string;
  entity: string;
  context: string;
  file: string;
}

interface TitanGraphProps {
  data: TitanNode[];
  onSelectNode: (node: TitanNode) => void;
}

export const TitanGraph: React.FC<TitanGraphProps> = ({ data, onSelectNode }) => {
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <h3 className="text-xs text-blue-500 uppercase font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
        Primordial Titan Knowledge Graph
      </h3>
      <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {data.map((node, i) => (
          <div 
            key={i} 
            onClick={() => onSelectNode(node)}
            className="p-3 bg-black/40 border border-zinc-800/50 rounded hover:border-blue-500/50 transition-all group cursor-pointer hover:bg-zinc-800/20 active:scale-95"
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-widest ${
                node.category === 'Subject' ? 'bg-blue-900/30 text-blue-400' :
                node.category === 'Injury' ? 'bg-red-900/30 text-red-400' :
                node.category === 'Legal' ? 'bg-purple-900/30 text-purple-400' :
                'bg-green-900/30 text-green-400'
              }`}>
                {node.category}
              </span>
              <span className="text-[9px] text-zinc-600 font-mono">
                {node.file.split('/').pop()}
              </span>
            </div>
            <div className="text-sm font-bold text-zinc-200 mb-1 group-hover:text-blue-300">
              {node.entity}
            </div>
            <div className="text-[9px] text-zinc-600 italic leading-tight line-clamp-2">
              {node.context}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
