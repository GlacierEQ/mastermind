import React from 'react';

/**
 * High-performance, low-latency HUD Card for Mastermind Dashboards.
 */
export const NexusCard: React.FC<{ title: string; children: React.ReactNode; glow?: string }> = ({ title, children, glow = "blue" }) => {
  const glowStyles: Record<string, string> = {
    blue: "shadow-[0_0_15px_rgba(59,130,246,0.2)] border-blue-500/30",
    red: "shadow-[0_0_15px_rgba(239,68,68,0.2)] border-red-500/30",
    purple: "shadow-[0_0_15px_rgba(168,85,247,0.2)] border-purple-500/30",
  };

  return (
    <div className={`bg-zinc-900/90 border rounded-2xl p-6 backdrop-blur-xl ${glowStyles[glow]}`}>
      <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-500 mb-4">{title}</h3>
      {children}
    </div>
  );
};
