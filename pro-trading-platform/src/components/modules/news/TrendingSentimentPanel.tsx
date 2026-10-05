import React from 'react';
import { useNewsStore } from '@/store/useNewsStore';

export function TrendingSentimentPanel() {
  const { trending, marketSentiment } = useNewsStore();

  return (
    <div className="space-y-6">
      {/* Sentiment Gauge */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-6 text-center">Market Sentiment</h3>
        
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-positive">{marketSentiment.bullish}%</span>
            <span className="text-xs text-muted-foreground uppercase">Bullish</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-foreground">{marketSentiment.neutral}%</span>
            <span className="text-xs text-muted-foreground uppercase">Neutral</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-negative">{marketSentiment.bearish}%</span>
            <span className="text-xs text-muted-foreground uppercase">Bearish</span>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="h-2 w-full rounded-full flex overflow-hidden mt-4">
          <div className="bg-positive h-full" style={{ width: `${marketSentiment.bullish}%` }} />
          <div className="bg-muted h-full" style={{ width: `${marketSentiment.neutral}%` }} />
          <div className="bg-negative h-full" style={{ width: `${marketSentiment.bearish}%` }} />
        </div>
      </div>

      {/* Trending List */}
      <div className="bg-card rounded-2xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">Trending in News</h3>
        </div>
        <div className="p-2 space-y-1">
          {trending.map((item, idx) => (
            <div key={item.symbol} className="flex items-center justify-between p-3 rounded-xl hover:bg-background/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground w-4">#{idx + 1}</span>
                <span className="font-semibold text-foreground">{item.symbol}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  item.sentiment === 'Bullish' ? 'text-positive' : 
                  item.sentiment === 'Bearish' ? 'text-negative' : 'text-muted-foreground'
                }`}>
                  {item.sentiment}
                </span>
                <span className="text-xs text-muted-foreground">{item.mentions} mentions</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
