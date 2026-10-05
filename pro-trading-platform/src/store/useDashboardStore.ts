import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W';
type AppTab =
  | 'Dashboard'
  | 'Stocks'
  | 'Crypto'
  | 'Forex'
  | 'Watchlist'
  | 'Portfolio'
  | 'Alerts'
  | 'News'
  | 'Economic Calendar'
  | 'Settings'
  | 'Screener';

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

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  status: 'active' | 'triggered';
  createdAt: string;
  note?: string;
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  category: 'Stocks' | 'Crypto' | 'Forex' | 'ETF';
  addedAt: string;
}

interface DashboardState {
  activeSymbol: string;
  activeAsset: Asset | null;
  activeTimeframe: Timeframe;
  activeTab: AppTab;
  watchlist: string[];
  alerts: PriceAlert[];
  portfolio: PortfolioPosition[];
  sidebarCollapsed: boolean;

  // Actions
  setActiveSymbol: (symbol: string) => void;
  setActiveAsset: (asset: Asset | null) => void;
  setActiveTimeframe: (tf: Timeframe) => void;
  setActiveTab: (tab: AppTab) => void;
  toggleWatchlist: (symbol: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Alert actions
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'status'>) => void;
  removeAlert: (id: string) => void;
  triggerAlert: (id: string) => void;

  // Portfolio actions
  addPosition: (pos: Omit<PortfolioPosition, 'id' | 'addedAt'>) => void;
  removePosition: (id: string) => void;
  updatePositionPrice: (symbol: string, currentPrice: number) => void;
}

const DEFAULT_PORTFOLIO: PortfolioPosition[] = [
  {
    id: 'pos-1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    quantity: 10,
    avgBuyPrice: 165.5,
    currentPrice: 178.2,
    category: 'Stocks',
    addedAt: '2024-01-15',
  },
  {
    id: 'pos-2',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    quantity: 0.5,
    avgBuyPrice: 42000,
    currentPrice: 67500,
    category: 'Crypto',
    addedAt: '2024-02-20',
  },
  {
    id: 'pos-3',
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    quantity: 5,
    avgBuyPrice: 450,
    currentPrice: 875,
    category: 'Stocks',
    addedAt: '2024-03-10',
  },
  {
    id: 'pos-4',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    quantity: 8,
    avgBuyPrice: 380,
    currentPrice: 415,
    category: 'Stocks',
    addedAt: '2024-01-28',
  },
  {
    id: 'pos-5',
    symbol: 'ETH',
    name: 'Ethereum',
    quantity: 2.5,
    avgBuyPrice: 2800,
    currentPrice: 3500,
    category: 'Crypto',
    addedAt: '2024-02-14',
  },
];

const DEFAULT_ALERTS: PriceAlert[] = [
  {
    id: 'alert-1',
    symbol: 'BTC/USD',
    targetPrice: 100000,
    direction: 'above',
    status: 'active',
    createdAt: '2024-09-01',
    note: 'ATH target',
  },
  {
    id: 'alert-2',
    symbol: 'NVDA',
    targetPrice: 900,
    direction: 'above',
    status: 'active',
    createdAt: '2024-09-10',
    note: 'Breakout target',
  },
  {
    id: 'alert-3',
    symbol: 'TSLA',
    targetPrice: 200,
    direction: 'below',
    status: 'triggered',
    createdAt: '2024-08-20',
    note: 'Support level',
  },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      activeSymbol: 'BTC/USD',
      activeAsset: null,
      activeTimeframe: '1D',
      activeTab: 'Dashboard',
      watchlist: ['BTC/USD', 'NVDA', 'AAPL', 'MSFT', 'ETH', 'EUR/USD'],
      alerts: DEFAULT_ALERTS,
      portfolio: DEFAULT_PORTFOLIO,
      sidebarCollapsed: false,

      setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
      setActiveAsset: (asset) => set({ activeAsset: asset }),
      setActiveTimeframe: (tf) => set({ activeTimeframe: tf }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toggleWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.includes(symbol)
            ? state.watchlist.filter((s) => s !== symbol)
            : [...state.watchlist, symbol],
        })),

      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            ...state.alerts,
            {
              ...alert,
              id: `alert-${Date.now()}`,
              status: 'active',
              createdAt: new Date().toISOString().split('T')[0],
            },
          ],
        })),

      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),

      triggerAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, status: 'triggered' } : a
          ),
        })),

      addPosition: (pos) =>
        set((state) => ({
          portfolio: [
            ...state.portfolio,
            {
              ...pos,
              id: `pos-${Date.now()}`,
              addedAt: new Date().toISOString().split('T')[0],
            },
          ],
        })),

      removePosition: (id) =>
        set((state) => ({
          portfolio: state.portfolio.filter((p) => p.id !== id),
        })),

      updatePositionPrice: (symbol, currentPrice) =>
        set((state) => ({
          portfolio: state.portfolio.map((p) =>
            p.symbol === symbol ? { ...p, currentPrice } : p
          ),
        })),
    }),
    {
      name: 'marketlens-dashboard-store',
      partialize: (state) => ({
        watchlist: state.watchlist,
        alerts: state.alerts,
        portfolio: state.portfolio,
        sidebarCollapsed: state.sidebarCollapsed,
        activeTimeframe: state.activeTimeframe,
      }),
    }
  )
);
