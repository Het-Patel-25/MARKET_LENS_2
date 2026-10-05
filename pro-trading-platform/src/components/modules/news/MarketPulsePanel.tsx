import React from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';

export function MarketPulsePanel() {
  const { setActiveSymbol, setActiveTab } = useDashboardStore();

  // Mock data - in a real app this could come from a WebSocket or an API
  const pulseData = [
    { symbol: 'S&P 500', change: '+0.82%', val: 0.82 },
    { symbol: 'NASDAQ', change: '+1.12%', val: 1.12 },
    { symbol: 'NIFTY 50', change: '+0.64%', val: 0.64 },
    { symbol: 'BTC', change: '+2.14%', val: 2.14 },
    { symbol: 'ETH', change: '+1.73%', val: 1.73 },
    { symbol: 'GOLD', change: '-0.21%', val: -0.21 },
    { symbol: 'EUR/USD', change: '+0.12%', val: 0.12 },
  ];

  const handleRowClick = (sym: string) => {
    // Map nice names to trading view standard for dashboard demo
    let mapped = sym;
    if (sym === 'BTC') mapped = 'BTC/USD';
    
    setActiveSymbol(mapped);
    setActiveTab('Dashboard');
  };

  return (
    <div className="bg-card rounded-2xl border border-border flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">Market Pulse</h3>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {pulseData.map((item, i) => (
            <button
              key={i}
              onClick={() => handleRowClick(item.symbol)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-background/50 transition-colors group"
            >
              <span className="font-semibold text-sm group-hover:text-primary transition-colors">{item.symbol}</span>
              <span className={`text-sm font-medium ${item.val >= 0 ? 'text-positive' : 'text-negative'}`}>
                {item.change}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
