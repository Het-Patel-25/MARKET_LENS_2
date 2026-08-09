import React from 'react';
import { Asset, useDashboardStore } from '../../../store/useDashboardStore';
import { getTradingViewSymbol } from '../../../utils/symbolMapper';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScreenerResultsProps {
  results: Asset[];
  loading: boolean;
}

export function ScreenerResults({ results, loading }: ScreenerResultsProps) {
  const { activeSymbol, setActiveSymbol, setActiveAsset } = useDashboardStore();

  const handleRowClick = (asset: Asset) => {
    setActiveAsset(asset);
    const tvSymbol = getTradingViewSymbol(asset.market_type, asset.exchange, asset.symbol);
    setActiveSymbol(tvSymbol);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col mt-4">
        <h3 className="font-semibold mb-3">RESULTS</h3>
        <div className="flex-1 border border-border rounded-xl flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Running Screener Engine...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">RESULTS ({results.length})</h3>
      </div>
      
      <div className="flex-1 border border-border rounded-xl overflow-hidden bg-muted/10 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Symbol</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold text-right">Price</th>
                <th className="px-4 py-3 font-semibold text-right">RSI (14)</th>
                <th className="px-4 py-3 font-semibold text-right">SMA 20</th>
                <th className="px-4 py-3 font-semibold text-right">SMA 50</th>
                <th className="px-4 py-3 font-semibold text-right">Vol Ratio</th>
                <th className="px-4 py-3 font-semibold text-right">P/E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No results found matching your criteria.
                  </td>
                </tr>
              ) : (
                results.map((r, i) => {
                  const tvSymbol = getTradingViewSymbol(r.market_type, r.exchange, r.symbol);
                  const isSelected = activeSymbol === tvSymbol;
                  return (
                    <tr 
                      key={i} 
                      onClick={() => handleRowClick(r)}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                    >
                      <td className="px-4 py-2.5 font-medium">{r.symbol}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.name}</td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {r.close_price ? Number(r.close_price).toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {r.rsi_14 ? (
                          <span className={r.rsi_14 > 70 ? 'text-red-400' : r.rsi_14 < 30 ? 'text-green-400' : ''}>
                            {Number(r.rsi_14).toFixed(1)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right">{r.sma_20 ? Number(r.sma_20).toFixed(2) : '-'}</td>
                      <td className="px-4 py-2.5 text-right">{r.sma_50 ? Number(r.sma_50).toFixed(2) : '-'}</td>
                      <td className="px-4 py-2.5 text-right">{r.volume_ratio ? Number(r.volume_ratio).toFixed(1) + 'x' : '-'}</td>
                      <td className="px-4 py-2.5 text-right">{r.pe_ratio ? Number(r.pe_ratio).toFixed(2) : '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
