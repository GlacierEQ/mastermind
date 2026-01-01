import React, { useEffect, useState } from 'react';

export const SystemMetrics: React.FC = () => {
  const [cpu, setCpu] = useState(15);
  const [net, setNet] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => Math.max(10, Math.min(95, prev + (Math.random() * 10 - 5))));
      setNet(prev => Math.max(5, Math.min(100, prev + (Math.random() * 20 - 10))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl backdrop-blur-md">
      <h2 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-4">Core System Metrics</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase">
            <span>Neural CPU Load</span>
            <span className="text-blue-500">{cpu.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${cpu}%` }}></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase">
            <span>Quantum Throughput</span>
            <span className="text-purple-500">{net.toFixed(0)} TB/s</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${net}%` }}></div>
          </div>
        </div>
        <div className="pt-2">
          <div className="flex gap-1 h-8 items-end">
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                className="flex-1 bg-zinc-800" 
                style={{ height: `${Math.random() * 100}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
