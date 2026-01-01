import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-zinc-900">
      <aside className="w-64 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700">
        <div className="p-4 font-bold text-xl">Supabase Pro</div>
        <nav className="mt-4 px-2">
          <a href="/dashboard" className="block px-4 py-2 rounded bg-blue-500 text-white">Dashboard</a>
          <a href="/analytics" className="block px-4 py-2 mt-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700">Analytics</a>
          <a href="/profile" className="block px-4 py-2 mt-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Workspace</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Mastermind Engine: Active</span>
            <div className="w-8 h-8 rounded-full bg-blue-500"></div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
