import React from 'react';

interface DocumentPreviewProps {
  node: {
    category: string;
    entity: string;
    context: string;
    file: string;
  } | null;
  onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-10">
      <div className="bg-zinc-900 border border-blue-500/30 rounded-3xl w-full max-w-4xl h-full flex flex-col overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Forensic Preview</div>
            <div className="text-xl font-black text-zinc-100 uppercase">{node.file}</div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 p-10 overflow-y-auto font-serif text-zinc-400 leading-relaxed bg-zinc-950/50">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center border-b border-zinc-800 pb-8 mb-10">
              <div className="text-2xl font-black text-zinc-100 mb-2 tracking-tighter">FEDERAL FORENSIC CASE MATRIX</div>
              <div className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">Confidential Exhibit / Protocol: TITANIC DEADROP</div>
            </div>
            
            <p className="indent-8 italic">
              "...Pursuant to the Primordial Titan harvest protocol, the following artifact has been extracted and redacted for legal sufficiency. Analysis indicates a direct correlation between [REDACTED] and the {node.category} entity identified as <span className="text-blue-400 font-bold underline decoration-blue-500/30">{node.entity}</span>."
            </p>

            <div className="p-8 bg-zinc-900/50 border-x-4 border-blue-500/20 font-mono text-sm leading-relaxed">
              <div className="text-xs text-zinc-600 mb-4 font-bold tracking-widest uppercase">Redacted Snippet:</div>
              {node.context}
            </div>

            <p className="indent-8">
              "The evidence suggests a systemic pattern of {node.category.toLowerCase()} related incidents. Further forensic imaging via the Microwave Nuke protocol is recommended to ensure bit-perfect preservation of the associated metadata strings. All [REDACTED] data points have been stripped to satisfy declassification requirements."
            </p>
            
            <div className="pt-20 flex justify-center opacity-20 grayscale pointer-events-none">
                <div className="border-4 border-zinc-700 p-4 text-4xl font-black uppercase rotate-12">ZENITH_SEALED</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-black/40 border-t border-zinc-800 flex justify-between items-center px-8">
          <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Bates ID: EXH-{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-xs font-bold uppercase rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">Download Original</button>
            <button className="px-4 py-2 bg-zinc-800 text-xs font-bold uppercase rounded-lg hover:bg-zinc-700 transition-colors">Decrypt Full View</button>
          </div>
        </div>
      </div>
    </div>
  );
};
