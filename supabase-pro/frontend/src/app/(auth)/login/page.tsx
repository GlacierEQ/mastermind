import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-md w-full p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Mastermind Portal</h2>
          <p className="text-gray-500 mt-2">Secure access to GlacierEQ Ecosystem</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg" placeholder="admin@glaciereq.io" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passkey</label>
            <input type="password" className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg" placeholder="••••••••" />
          </div>
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
