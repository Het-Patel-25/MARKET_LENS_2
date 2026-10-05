import React, { useState } from 'react';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { FilterCondition } from './ScreenerFilters';

interface AIScreenerPanelProps {
  onFiltersGenerated: (market: string, exchange: string, filters: FilterCondition[]) => void;
}

export function AIScreenerPanel({ onFiltersGenerated }: AIScreenerPanelProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScreen = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse AI query');
      
      if (data.filters) {
        onFiltersGenerated(
          data.filters.market || 'INDIA', 
          data.filters.exchange || '', 
          data.filters.filters || []
        );
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/20 border border-border p-4 rounded-xl flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10 rounded-full" />
      <div className="flex items-center gap-2 text-blue-400">
        <Bot className="w-5 h-5" />
        <h3 className="font-semibold">AI SCREENER</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Describe what you're looking for in plain English.
        <br/>
        <span className="text-xs opacity-70">Example: "Find Indian stocks with RSI below 30 and PE less than 15"</span>
      </p>

      <div className="flex gap-2 mt-2">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScreen()}
          placeholder="Type your strategy..."
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={handleScreen}
          disabled={loading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          AI SCREEN
        </button>
      </div>
      
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
