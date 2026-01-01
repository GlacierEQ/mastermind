'use client';

import React, { useState } from 'react';
import { NexusProvider } from '../../context/NexusContext';
import { TitanGraph } from '../../components/mastermind/TitanGraph';
import { ControlPanel } from '../../components/mastermind/ControlPanel';
import { MicrowaveStatus } from '../../components/mastermind/MicrowaveStatus';
import { MissionFeed } from '../../components/mastermind/MissionFeed';
import { SystemMetrics } from '../../components/mastermind/SystemMetrics';
import { DocumentPreview } from '../../components/mastermind/DocumentPreview';
import { Ring3Panel } from "../../components/mastermind/Ring3Panel";
import { Ring4Ascension } from "../../components/mastermind/Ring4Ascension";
import { AnomalyMatrix } from "../../components/mastermind/AnomalyMatrix";
import { AnomalyDeepDive } from "../../components/mastermind/AnomalyDeepDive";
import { TheStorm } from "../../components/mastermind/TheStorm";
import { SingularityCore } from "../../components/mastermind/SingularityCore";
import { TomahawkPanel } from "../../components/mastermind/TomahawkPanel";
import { ChatHistoryHUD } from "../../components/mastermind/ChatHistoryHUD";
import { ConnectivityMap } from "../../components/mastermind/ConnectivityMap";
import { Mem0Dashboard } from "../../components/mastermind/Mem0Dashboard";
import { CoreRepoStatus } from "../../components/mastermind/CoreRepoStatus";
import { SymbolicMap } from "../../components/mastermind/SymbolicMap";

interface TitanNode {
  category: string;
  entity: string;
  context: string;
  file: string;
}

const titanData: TitanNode[] = [
  { category: "Subject", entity: "KKDCB", context: "...The minor child KKDCB has suffered severe physical injuries...", file: "FEDERAL_MATRIX_REPORT.md" },
  { category: "Injury", entity: "Titanium Screws", context: "...fractured arm requiring surgery with titanium screws installed...", file: "TITAN_RELATIONSHIP_GRAPH.json" },
  { category: "Legal", entity: "FC-DA-24", context: "...violation of procedural due process in case FC-DA-24...", file: "STRATEGIC_ANALYSIS.md" }
];

export default function MastermindNexusPage() {
  const [selectedNode, setSelectedNode] = useState<TitanNode | null>(null);

  return (
    <NexusProvider>
      <div className="min-h-screen bg-black text-white p-8 font-mono overflow-auto selection:bg-blue-500/30">
        <DocumentPreview node={selectedNode} onClose={() => setSelectedNode(null)} />

        <div className="flex justify-between items-center border-b border-blue-900/50 pb-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-4 h-4 bg-blue-500 animate-pulse rounded-full shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
            <h1 className="text-3xl font-black uppercase italic">Apex NEXUS Mastermind</h1>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-blue-400 tracking-[0.3em]">NODE: GLACIER_TITAN_ALPHA</div>
            <div className="text-xl font-black text-blue-500">100% SECURE</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3 space-y-8">
            <ControlPanel />
            <Ring3Panel />
            <Ring4Ascension />
            <AnomalyMatrix />
            <AnomalyDeepDive />
            <SystemMetrics />
            <MicrowaveStatus />
          </div>

          <div className="col-span-6 space-y-8">
            <SingularityCore />
            <TheStorm />
            <SymbolicMap />
            <TitanGraph data={titanData} onSelectNode={(node) => setSelectedNode(node)} />
            <TomahawkPanel />
            <ChatHistoryHUD />
            <ConnectivityMap />
            <Mem0Dashboard />
            <CoreRepoStatus />
          </div>

          <div className="col-span-3">
             <MissionFeed />
          </div>
        </div>
      </div>
    </NexusProvider>
  );
}
