import React, { useState } from 'react';
import { Search, Calendar, Activity } from 'lucide-react';
import { useNewsStore } from '@/store/useNewsStore';

export function NewsHeader() {
  const { searchQuery, setSearchQuery, activeTimeFilter, setActiveTimeFilter } = useNewsStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
  };

  const timeFilters = ['Latest', '1 Hour', 'Today', '24 Hours', '7 Days'];

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-border">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">NEWS</h1>
        <p className="text-muted-foreground">Real-time market news, events and sentiment</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search News / Company / Ticker"
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </form>

        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
          <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
          <select 
            className="bg-transparent border-none text-sm text-foreground focus:ring-0 outline-none pr-2 py-1"
            value={activeTimeFilter}
            onChange={(e) => setActiveTimeFilter(e.target.value)}
          >
            {timeFilters.map(tf => (
              <option key={tf} value={tf} className="bg-card text-foreground">{tf}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
