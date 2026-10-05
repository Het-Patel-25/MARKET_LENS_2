"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { TradingChart } from '@/components/chart/TradingChart';
import { WatchlistModule } from '@/components/modules/WatchlistModule';
import { ScreenerModule } from '@/components/modules/screener/ScreenerModule';
import { NewsModule } from '@/components/modules/news/NewsModule';
import { EconomicCalendarModule } from '@/components/modules/economic-calendar/EconomicCalendarModule';
import { PortfolioModule } from '@/components/modules/portfolio/PortfolioModule';
import { AlertsModule } from '@/components/modules/alerts/AlertsModule';
import { SettingsModule } from '@/components/modules/settings/SettingsModule';
import { useDashboardStore } from '@/store/useDashboardStore';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
  Volume2,
  BarChart2,
  Activity,
} from 'lucide-react';

const SYMBOL_MAP: Record<string, string> = {
  'BTC/USD': 'BINANCE:BTCUSDT',
  'BTC': 'BINANCE:BTCUSDT',
  'ETH': 'BINANCE:ETHUSDT',
  'EUR/USD': 'FX:EURUSD',
  'GBP/USD': 'FX:GBPUSD',
  'USD/JPY': 'FX:USDJPY',
  'NVDA': 'NASDAQ:NVDA',
  'TSLA': 'NASDAQ:TSLA',
  'AAPL': 'NASDAQ:AAPL',
  'MSFT': 'NASDAQ:MSFT',
  'AMZN': 'NASDAQ:AMZN',
  'GOOGL': 'NASDAQ:GOOGL',
  'META': 'NASDAQ:META',
};

const TF_MAP: Record<string, string> = {
  '1m': '1', '5m': '5', '15m': '15', '1H': '60',
  '4H': '240', '1D': 'D', '1W': 'W',
};

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'] as const;

const METRICS: Record<string, { high: string; low: string; vol: string; cap: string; change: string; price: string; isUp: boolean }> = {
  'BTC/USD': { high: '95,100', low: '90,400', vol: '45.2K BTC', cap: '$1.82T', change: '+4.21%', price: '94,230', isUp: true },
  'NVDA':    { high: '880.00', low: '850.50', vol: '45.2M',    cap: '$2.15T', change: '+2.84%', price: '875.40', isUp: true },
  'TSLA':    { high: '215.00', low: '205.50', vol: '110.5M',   cap: '$672B',  change: '-1.52%', price: '210.50', isUp: false },
  'EUR/USD': { high: '1.0905', low: '1.0810', vol: '$12B',     cap: 'N/A',    change: '-0.31%', price: '1.0850', isUp: false },
  'AAPL':    { high: '180.50', low: '174.20', vol: '62.4M',    cap: '$2.76T', change: '+1.28%', price: '178.20', isUp: true },
  'MSFT':    { high: '418.00', low: '410.00', vol: '22.1M',    cap: '$3.08T', change: '+0.89%', price: '415.00', isUp: true },
  'ETH':     { high: '3,620',  low: '3,420',  vol: '12.8K ETH', cap: '$421B', change: '+3.12%', price: '3,500', isUp: true },
};

function Dashboard() {
  const { activeSymbol, activeTimeframe, setActiveTimeframe } = useDashboardStore();
  const tvSymbol = SYMBOL_MAP[activeSymbol] || activeSymbol;
  const tvInterval = TF_MAP[activeTimeframe] || 'D';
  const m = METRICS[activeSymbol] || { high: '—', low: '—', vol: '—', cap: '—', change: '—', price: '—', isUp: true };

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in">
      {/* ── CHART HEADER ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Symbol Info */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{activeSymbol}</h1>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold font-mono ${
                m.isUp ? 'text-positive bg-positive/10' : 'text-negative bg-negative/10'
              }`}>
                {m.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {m.price}
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${m.isUp ? 'text-positive' : 'text-negative'}`}>
                {m.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {m.change}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1.5 text-xs text-positive">
                <span className="live-dot" />
                Live
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">TradingView</span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTimeframe === tf
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHART ── */}
      <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden relative min-h-0">
        <TradingChart
          key={`${activeSymbol}-${activeTimeframe}`}
          symbol={tvSymbol}
          interval={tvInterval}
        />
      </div>

      {/* ── METRICS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {[
          { label: '24h High', val: m.high, icon: <TrendingUp className="w-4 h-4" />, color: 'text-positive' },
          { label: '24h Low', val: m.low, icon: <TrendingDown className="w-4 h-4" />, color: 'text-negative' },
          { label: '24h Volume', val: m.vol, icon: <Volume2 className="w-4 h-4" />, color: 'text-primary' },
          { label: 'Market Cap', val: m.cap, icon: <BarChart2 className="w-4 h-4" />, color: 'text-warning' },
        ].map((metric) => (
          <div key={metric.label} className="metric-card px-4 py-3 flex items-center gap-3">
            <div className={`${metric.color} opacity-60`}>{metric.icon}</div>
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{metric.label}</div>
              <div className="font-mono text-base font-bold mt-0.5">{metric.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { activeTab } = useDashboardStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':       return <Dashboard />;
      case 'Watchlist':       return <WatchlistModule category="All" />;
      case 'Stocks':          return <WatchlistModule category="Stocks" />;
      case 'Crypto':          return <WatchlistModule category="Crypto" />;
      case 'Forex':           return <WatchlistModule category="Forex" />;
      case 'Screener':        return <ScreenerModule />;
      case 'News':            return <NewsModule />;
      case 'Economic Calendar': return <EconomicCalendarModule />;
      case 'Portfolio':       return <PortfolioModule />;
      case 'Alerts':          return <AlertsModule />;
      case 'Settings':        return <SettingsModule />;
      default:                return <Dashboard />;
    }
  };

  return (
    <AppLayout>
      {renderContent()}
    </AppLayout>
  );
}
