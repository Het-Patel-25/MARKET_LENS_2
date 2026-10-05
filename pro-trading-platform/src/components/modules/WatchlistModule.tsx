"use client";

import React, { useState, useEffect } from 'react';
import { Search, Star, ArrowUpRight, ArrowDownRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';

export function WatchlistModule({ category = 'All' }: { category?: 'All' | 'Stocks' | 'Crypto' | 'Forex' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveSymbol, setActiveTab, watchlist, toggleWatchlist } = useDashboardStore();

  useEffect(() => {
    fetch('http://localhost:5000/api/screener/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters: [] })
    })
      .then(res => res.json())
      .then(data => {
        const mapped = (data.results || []).map((r: any) => ({
          symbol: r.symbol,
          name: r.name || r.symbol,
          price: r.close_price ? r.close_price.toFixed(2) : 'N/A',
          change: 'N/A',
          isUp: true,
          vol: r.volume ? (r.volume / 1000000).toFixed(1) + 'M' : 'N/A',
          cap: 'N/A',
          category: r.market_type === 'equity' ? 'Stocks' : r.market_type === 'crypto' ? 'Crypto' : 'Forex'
        }));
        setAssets(mapped);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = assets.filter(item => {
    // If we are in the main 'Watchlist' view, ONLY show starred items, UNLESS they are searching.
    // If they are searching, show all items that match so they can find new things to star.
    const matchesCategory = (category === 'All' && searchTerm === '') 
      ? watchlist.includes(item.symbol) 
      : (category === 'All' ? true : item.category === category);
    const matchesSearch = item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRowClick = (symbol: string) => {
    setActiveSymbol(symbol);
    setActiveTab('Dashboard');
  };

  const handleAddCustomInstrument = async () => {
    if (!searchTerm) return;
    const symbol = searchTerm.toUpperCase();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/market/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, name: symbol, market_type: 'equity' })
      });
      if (res.ok) {
        // Fetch all assets again to update the table
        const runRes = await fetch('http://localhost:5000/api/screener/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: [] })
        });
        const data = await runRes.json();
        const mapped = (data.results || []).map((r: any) => ({
          symbol: r.symbol,
          name: r.name || r.symbol,
          price: r.close_price ? r.close_price.toFixed(2) : 'N/A',
          change: 'N/A',
          isUp: true,
          vol: r.volume ? (r.volume / 1000000).toFixed(1) + 'M' : 'N/A',
          cap: 'N/A',
          category: r.market_type === 'equity' ? 'Stocks' : r.market_type === 'crypto' ? 'Crypto' : 'Forex'
        }));
        setAssets(mapped);
        
        // Add to watchlist automatically
        if (!watchlist.includes(symbol)) {
          toggleWatchlist(symbol);
        }
        setSearchTerm('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (category === 'All') return 'Watchlist';
    return `${category} Markets`;
  };

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search symbols or names..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12"></th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Price</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">24h Change</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Volume</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Market Cap</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    Loading market data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <p className="mb-4 text-lg">No {category !== 'All' ? category : ''} symbols found matching "{searchTerm}"</p>
                    {searchTerm && (
                      <button 
                        onClick={handleAddCustomInstrument}
                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium shadow-md shadow-primary/20"
                      >
                        Track new instrument: {searchTerm.toUpperCase()}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => handleRowClick(item.symbol)}
                  className="border-b border-border/50 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleWatchlist(item.symbol)}
                      className={`transition-colors ${watchlist.includes(item.symbol) ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}
                    >
                      <Star className={`w-4 h-4 ${watchlist.includes(item.symbol) ? 'fill-warning text-warning' : ''}`} />
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="font-bold group-hover:text-primary transition-colors">{item.symbol}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.name}</div>
                  </td>
                  <td className="p-4 text-right font-mono font-medium">
                    {item.price}
                  </td>
                  <td className="p-4 text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${item.isUp ? 'text-positive bg-positive/10' : 'text-negative bg-negative/10'}`}>
                      {item.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.change}
                    </div>
                  </td>
                  <td className="p-4 text-right text-sm text-muted-foreground">
                    {item.vol}
                  </td>
                  <td className="p-4 text-right text-sm text-muted-foreground">
                    {item.cap}
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
