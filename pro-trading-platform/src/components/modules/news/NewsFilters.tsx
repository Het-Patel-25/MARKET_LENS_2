import React from 'react';
import { useNewsStore } from '@/store/useNewsStore';

export function NewsFilters() {
  const { activeMarket, setActiveMarket, activeCategory, setActiveCategory } = useNewsStore();

  const markets = ['All', 'Stocks', 'Crypto', 'Forex', 'Indices', 'Commodities', 'ETF', 'Futures', 'Bonds'];
  const categories = [
    'All', 'Market', 'Economy', 'Central Banks', 'Earnings', 
    'M&A', 'IPO', 'Regulation', 'Technology', 'Geopolitics'
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Market Selector */}
      <div className="flex flex-wrap gap-2">
        {markets.map(market => (
          <button
            key={market}
            onClick={() => setActiveMarket(market)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
              activeMarket === market
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
            }`}
          >
            {market.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
        <span className="text-xs font-semibold text-muted-foreground py-1.5 mr-2">CATEGORIES:</span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeCategory === cat
                ? 'bg-foreground/10 text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
