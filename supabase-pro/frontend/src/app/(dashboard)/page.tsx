import React from 'react';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700">
          <h3 className="font-medium mb-2">Service Node {i}</h3>
          <p className="text-sm text-gray-500">Active and syncing with GlacierEQ Nexus.</p>
          <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
