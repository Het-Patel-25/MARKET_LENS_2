import React, { useState } from 'react';
import { Plus, X, Play, Save, Star } from 'lucide-react';

export interface FilterCondition {
  indicator: string;
  operator: string;
  value: number;
}

interface ScreenerFiltersProps {
  onRunScreener: (filters: FilterCondition[]) => void;
  market: string;
  setMarket: (m: string) => void;
  exchange: string;
  setExchange: (e: string) => void;
}

const INDICATORS = ['RSI', 'SMA_20', 'SMA_50', 'RELATIVE_VOLUME', 'PE', 'PRICE'];
const OPERATORS = ['>', '<', '>=', '<=', '=='];
const MARKETS = ['INDIA', 'USA', 'CRYPTO', 'FOREX'];

const QUICK_SCREENS = [
  { name: 'Oversold', filters: [{ indicator: 'RSI', operator: '<', value: 45 }] },
  { name: 'Overbought', filters: [{ indicator: 'RSI', operator: '>', value: 60 }] },
  { name: 'High Volume', filters: [{ indicator: 'RELATIVE_VOLUME', operator: '>', value: 1.0 }] },
  { name: 'Value', filters: [{ indicator: 'PE', operator: '<', value: 25 }, { indicator: 'PE', operator: '>', value: 0 }] },
];

export function ScreenerFilters({ onRunScreener, market, setMarket, exchange, setExchange }: ScreenerFiltersProps) {
  const [filters, setFilters] = useState<FilterCondition[]>([]);

  const addFilter = () => {
    setFilters([...filters, { indicator: 'RSI', operator: '<', value: 30 }]);
  };

  const updateFilter = (index: number, key: keyof FilterCondition, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [key]: value };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const applyQuickScreen = (presetFilters: FilterCondition[]) => {
    setFilters(presetFilters);
    onRunScreener(presetFilters);
  };

  return (
    <div className="bg-muted/20 p-4 rounded-xl border border-border flex flex-col gap-4">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <h3 className="font-semibold">MARKET</h3>
        <select 
          className="bg-background border border-border rounded px-3 py-1"
          value={market}
          onChange={(e) => setMarket(e.target.value)}
        >
          {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        
        {market === 'INDIA' && (
          <select className="bg-background border border-border rounded px-3 py-1" value={exchange} onChange={(e) => setExchange(e.target.value)}>
            <option value="">Any Exchange</option>
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
        )}
        {market === 'USA' && (
          <select className="bg-background border border-border rounded px-3 py-1" value={exchange} onChange={(e) => setExchange(e.target.value)}>
            <option value="">Any Exchange</option>
            <option value="NASDAQ">NASDAQ</option>
            <option value="NYSE">NYSE</option>
          </select>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 pb-3 border-b border-border/50">
        <h3 className="w-full text-xs font-semibold text-muted-foreground uppercase">Quick Screens</h3>
        {QUICK_SCREENS.map(qs => (
          <button 
            key={qs.name}
            onClick={() => applyQuickScreen(qs.filters)}
            className="text-xs bg-card border border-border hover:border-primary/50 hover:text-primary px-3 py-1 rounded-full transition-colors flex items-center gap-1"
          >
            <Star className="w-3 h-3" /> {qs.name}
          </button>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">FILTERS</h3>
        <div className="flex flex-col gap-2">
          {filters.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <select 
                className="bg-background border border-border rounded px-2 py-1 text-sm"
                value={f.indicator}
                onChange={(e) => updateFilter(i, 'indicator', e.target.value)}
              >
                {INDICATORS.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              <select 
                className="bg-background border border-border rounded px-2 py-1 text-sm"
                value={f.operator}
                onChange={(e) => updateFilter(i, 'operator', e.target.value)}
              >
                {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
              <input 
                type="number"
                className="bg-background border border-border rounded px-2 py-1 text-sm w-24"
                value={f.value}
                onChange={(e) => updateFilter(i, 'value', parseFloat(e.target.value))}
              />
              {i > 0 && <span className="text-xs text-muted-foreground font-semibold">AND</span>}
              <button onClick={() => removeFilter(i)} className="p-1 hover:bg-red-500/20 rounded text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button 
          onClick={addFilter}
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded"
        >
          <Plus className="w-4 h-4" /> Add Filter
        </button>
        <button 
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground border border-border bg-card px-3 py-1.5 rounded"
        >
          <Save className="w-4 h-4" /> Save Screen
        </button>
        <div className="flex-1" />
        <button 
          onClick={() => setFilters([])}
          className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5"
        >
          Reset
        </button>
        <button 
          onClick={() => onRunScreener(filters)}
          className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded font-semibold transition-colors"
        >
          <Play className="w-4 h-4" fill="currentColor" /> RUN SCREENER
        </button>
      </div>
    </div>
  );
}
