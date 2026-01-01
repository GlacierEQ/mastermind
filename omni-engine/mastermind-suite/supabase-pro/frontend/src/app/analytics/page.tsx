import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Forensic Analytics</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Export Report</button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-gray-200 dark:border-zinc-700 h-64 flex items-end gap-2">
        {[40, 70, 45, 90, 65, 80, 30, 95, 55, 75].map((h, i) => (
          <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${h}%` }}></div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
          <div className="text-xs text-gray-500 uppercase">Artifacts Scanned</div>
          <div className="text-2xl font-mono">1,242,042</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
          <div className="text-xs text-gray-500 uppercase">Threats Neutralized</div>
          <div className="text-2xl font-mono">42</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
          <div className="text-xs text-gray-500 uppercase">Uptime</div>
          <div className="text-2xl font-mono">99.99%</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
          <div className="text-xs text-gray-500 uppercase">Nexus Sync</div>
          <div className="text-2xl font-mono text-green-500">OPTIMAL</div>
        </div>
      </div>
    </div>
  );
}
