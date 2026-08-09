/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { ScreenerFilters, FilterCondition } from './ScreenerFilters';
import { AIScreenerPanel } from './AIScreenerPanel';
import { ScreenerResults } from './ScreenerResults';
import { useDashboardStore, Asset } from '../../../store/useDashboardStore';
import { TradingChart } from '../../chart/TradingChart';
import { Bot, LineChart, Loader2 } from 'lucide-react';

export function ScreenerModule() {
  const [market, setMarket] = useState('INDIA');
  const [exchange, setExchange] = useState('');
  const [results, setResults] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { activeAsset, activeSymbol } = useDashboardStore();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const fetchResults = async (filters: FilterCondition[], forceMarket?: string, forceExchange?: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/screener/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          market: forceMarket || market, 
          exchange: forceExchange || exchange, 
          filters 
        })
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAIFilters = (aiMarket: string, aiExchange: string, aiFilters: FilterCondition[]) => {
    setMarket(aiMarket.toUpperCase());
    setExchange(aiExchange);
    fetchResults(aiFilters, aiMarket.toUpperCase(), aiExchange);
  };

  useEffect(() => {
    if (activeAsset) {
      setInsightLoading(true);
      setAiInsight(null);
      fetch(`http://localhost:5000/api/ai/insight/${activeAsset.symbol}`)
        .then(res => res.json())
        .then(data => setAiInsight(data.insight))
        .catch(() => setAiInsight('Failed to load insight.'))
        .finally(() => setInsightLoading(false));
    }
  }, [activeAsset]);

  // Initial fetch
  useEffect(() => {
    fetchResults([]);
  }, []);

  return (
    <div className="h-full flex gap-4 p-4 overflow-hidden">
      
      {/* Left Panel: Screener */}
      <div className="w-1/2 flex flex-col h-full overflow-hidden">
        <AIScreenerPanel onFiltersGenerated={handleAIFilters} />
        <div className="mt-4" />
        <ScreenerFilters 
          market={market} setMarket={setMarket}
          exchange={exchange} setExchange={setExchange}
          onRunScreener={fetchResults} 
        />
        <ScreenerResults results={results} loading={loading} />
      </div>

      {/* Right Panel: Chart & Analysis */}
      <div className="w-1/2 flex flex-col h-full bg-muted/10 border border-border rounded-xl overflow-hidden relative">
        {!activeAsset ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <LineChart className="w-12 h-12 mb-4 opacity-20" />
            <p>Select an instrument to view chart and analysis</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{activeAsset.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span className="px-2 py-0.5 bg-muted rounded font-mono">{activeSymbol}</span>
                  {activeAsset.close_price && (
                    <span className="font-semibold text-foreground">
                      {activeAsset.currency} {activeAsset.close_price}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-h-[400px]">
              <TradingChart key={activeSymbol} symbol={activeSymbol} />
            </div>

            <div className="h-[250px] border-t border-border bg-background/80 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold">AI ANALYSIS</h3>
              </div>
              
              {insightLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating insights...
                </div>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {aiInsight || 'No insight available.'}
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
