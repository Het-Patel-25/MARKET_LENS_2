import React from 'react';
import { Screener } from 'react-ts-tradingview-widgets';
import { WatchlistModule } from '../WatchlistModule';

export function ScreenerModule() {
  return (
    <div className="h-full flex gap-4 p-4 overflow-hidden">
      
      {/* Left Panel: Live TradingView Screener (All Stocks) */}
      <div className="w-1/2 flex flex-col h-full overflow-hidden border border-border rounded-xl">
        <Screener 
          colorTheme="dark" 
          width="100%" 
          height="100%" 
          defaultColumn="overview" 
          defaultScreen="most_capitalized"
          market="america" 
          showToolbar={true} 
        />
      </div>

      {/* Right Panel: Watchlist */}
      <div className="w-1/2 flex flex-col h-full overflow-hidden">
        <WatchlistModule />
      </div>

    </div>
  );
}
