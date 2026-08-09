import { create } from 'zustand';

type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W';
type AppTab = 'Dashboard' | 'Stocks' | 'Crypto' | 'Forex' | 'Watchlist' | 'Portfolio' | 'Alerts' | 'News' | 'Economic Calendar' | 'Settings' | 'Screener';

export interface Asset {
  symbol: string;
  name: string;
  market_type: string;
  exchange: string;
  currency: string;
  close_price?: number;
  rsi_14?: number;
  sma_20?: number;
  sma_50?: number;
  volume_ratio?: number;
  pe_ratio?: number;
}

interface DashboardState {
  activeSymbol: string;
  activeAsset: Asset | null;
  activeTimeframe: Timeframe;
  activeTab: AppTab;
  setActiveSymbol: (symbol: string) => void;
  setActiveAsset: (asset: Asset | null) => void;
  setActiveTimeframe: (tf: Timeframe) => void;
  setActiveTab: (tab: AppTab) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeSymbol: 'BINANCE:BTCUSD',
  activeAsset: null,
  activeTimeframe: '1D',
  activeTab: 'Dashboard',
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
  setActiveAsset: (asset) => set({ activeAsset: asset }),
  setActiveTimeframe: (tf) => set({ activeTimeframe: tf }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
