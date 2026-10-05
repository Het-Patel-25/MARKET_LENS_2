"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Wallet,
  Bell,
  Newspaper,
  Calendar,
  Settings,
  Search,
  User,
  Activity,
  BarChart2,
  TrendingUp,
  Globe,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Layers,
} from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';

/* ─── MARKET HOURS HELPER ─────────────────────────── */
function useMarketStatus() {
  const [status, setStatus] = useState<{ label: string; color: string; isOpen: boolean }>({
    label: 'Checking...',
    color: '#6B7494',
    isOpen: false,
  });

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const utcH = now.getUTCHours();
      const utcM = now.getUTCMinutes();
      const day = now.getUTCDay(); // 0=Sun, 6=Sat
      const totalMin = utcH * 60 + utcM;

      // NYSE: 13:30–20:00 UTC Mon-Fri
      if (day >= 1 && day <= 5 && totalMin >= 810 && totalMin < 1200) {
        setStatus({ label: 'NYSE Open', color: '#22D87A', isOpen: true });
      }
      // London: 08:00–16:30 UTC Mon-Fri
      else if (day >= 1 && day <= 5 && totalMin >= 480 && totalMin < 990) {
        setStatus({ label: 'LSE Open', color: '#22D87A', isOpen: true });
      }
      // Crypto is always open
      else {
        setStatus({ label: 'Crypto 24/7', color: '#4F8EF7', isOpen: true });
      }
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  return status;
}

/* ─── LIVE CLOCK ─────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-sm text-muted-foreground tabular-nums">
      {time}
    </span>
  );
}

/* ─── NAV ITEM ───────────────────────────────────── */
function NavItem({
  icon,
  label,
  active = false,
  onClick,
  collapsed,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group
        ${active
          ? 'bg-primary/10 text-primary font-semibold shadow-sm'
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
        }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}
      <span className="shrink-0 relative">
        {React.cloneElement(icon as any, { className: 'w-[18px] h-[18px]' })}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      {!collapsed && <span className="text-sm">{label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-3 bg-popover border border-border text-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg z-50 transition-opacity duration-150">
          {label}
        </span>
      )}
    </button>
  );
}

/* ─── MINI TICKER ────────────────────────────────── */
function MiniTicker({ symbol, price, change, up }: { symbol: string; price: string; change: string; up: boolean }) {
  const { setActiveSymbol, setActiveTab } = useDashboardStore();
  return (
    <div
      onClick={() => { setActiveSymbol(symbol); setActiveTab('Dashboard'); }}
      className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/60 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
    >
      <div>
        <div className="font-semibold text-sm group-hover:text-primary transition-colors">{symbol}</div>
        <div className="text-xs text-muted-foreground mt-0.5 font-mono">Vol 1.2B</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm font-medium">{price}</div>
        <div className={`flex items-center gap-0.5 justify-end text-xs font-semibold mt-0.5 ${up ? 'text-positive' : 'text-negative'}`}>
          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
    </div>
  );
}

/* ─── SEARCH MODAL ───────────────────────────────── */
function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const { setActiveSymbol, setActiveTab } = useDashboardStore();
  const suggestions = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'Stock' },
    { symbol: 'MSFT', name: 'Microsoft', type: 'Stock' },
    { symbol: 'BTC/USD', name: 'Bitcoin', type: 'Crypto' },
    { symbol: 'ETH', name: 'Ethereum', type: 'Crypto' },
    { symbol: 'EUR/USD', name: 'Euro/Dollar', type: 'Forex' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stock' },
    { symbol: 'AMZN', name: 'Amazon.com', type: 'Stock' },
  ].filter((s) =>
    query
      ? s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
      : true
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl glass rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbols, markets..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.symbol}
              onClick={() => {
                setActiveSymbol(s.symbol);
                setActiveTab('Dashboard');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{s.symbol}</div>
                <div className="text-xs text-muted-foreground truncate">{s.name}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium
                ${s.type === 'Crypto' ? 'bg-warning/10 text-warning' :
                  s.type === 'Forex' ? 'bg-info/10 text-info' :
                  'bg-positive/10 text-positive'}`}>
                {s.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── APP LAYOUT ─────────────────────────────────── */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab, alerts, sidebarCollapsed, setSidebarCollapsed } = useDashboardStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const marketStatus = useMarketStatus();
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;

  // Keyboard shortcut: Cmd+K / Ctrl+K for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navSections = [
    {
      label: 'Overview',
      items: [
        { icon: <BarChart2 />, label: 'Dashboard' },
      ],
    },
    {
      label: 'Markets',
      items: [
        { icon: <TrendingUp />, label: 'Stocks' },
        { icon: <Globe />, label: 'Crypto' },
        { icon: <LineChart />, label: 'Forex' },
      ],
    },
    {
      label: 'Tools',
      items: [
        { icon: <Search />, label: 'Screener' },
        { icon: <Layers />, label: 'Watchlist' },
        { icon: <Wallet />, label: 'Portfolio' },
        { icon: <Bell />, label: 'Alerts', badge: activeAlerts },
        { icon: <Newspaper />, label: 'News' },
        { icon: <Calendar />, label: 'Economic Calendar' },
      ],
    },
  ];

  const showRightPanel =
    activeTab !== 'Screener' &&
    activeTab !== 'News' &&
    activeTab !== 'Economic Calendar' &&
    activeTab !== 'Portfolio' &&
    activeTab !== 'Alerts' &&
    activeTab !== 'Settings';

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <aside
        className={`${sidebarCollapsed ? 'w-[72px]' : 'w-60'} border-r border-border bg-card flex flex-col transition-all duration-300 ease-in-out shrink-0 hidden md:flex relative z-20`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-border ${sidebarCollapsed ? 'justify-center px-0' : 'px-5 gap-2.5'}`}>
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-base tracking-tight text-gradient">
              MarketLens
            </span>
          )}
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navSections.map((section) => (
            <div key={section.label} className="mb-2">
              {!sidebarCollapsed && (
                <div className="px-3 pb-1.5 pt-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {section.label}
                </div>
              )}
              {sidebarCollapsed && <div className="h-3" />}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.label}
                    onClick={() => setActiveTab(item.label as any)}
                    collapsed={sidebarCollapsed}
                    badge={(item as any).badge}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Settings & Collapse */}
        <div className="p-2 border-t border-border space-y-0.5">
          <NavItem
            icon={<Settings />}
            label="Settings"
            active={activeTab === 'Settings'}
            onClick={() => setActiveTab('Settings')}
            collapsed={sidebarCollapsed}
          />
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-200"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed
              ? <ChevronRight className="w-[18px] h-[18px] mx-auto" />
              : (
                <>
                  <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
                  <span className="text-sm">Collapse</span>
                </>
              )}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* TOP HEADER */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          {/* Left: Search */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 bg-background/60 border border-border rounded-xl pl-3 pr-4 py-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-background/80 transition-all w-72 group"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Search markets...</span>
              <span className="text-xs border border-border rounded-md px-1.5 py-0.5 font-mono opacity-60 group-hover:opacity-100">
                ⌘K
              </span>
            </button>
          </div>

          {/* Right: Clock, Market Status, Notifs, User */}
          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <LiveClock />
            </div>

            {/* Market Status */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 border border-border">
              <span
                className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: marketStatus.color }}
              />
              <span className="text-xs font-medium" style={{ color: marketStatus.color }}>
                {marketStatus.label}
              </span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('Alerts')}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {activeAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeAlerts}
                </span>
              )}
            </button>

            {/* User Avatar */}
            <button
              onClick={() => setActiveTab('Settings')}
              className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-all"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Main area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background min-w-0">
            {children}
          </main>

          {/* Right Panel */}
          {showRightPanel && (
            <aside className="w-72 border-l border-border bg-card/30 hidden lg:flex flex-col shrink-0">
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-sm">Market Movers</span>
                <div className="flex items-center gap-1.5">
                  <span className="live-dot" />
                  <span className="text-xs text-positive font-medium">Live</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Top Gainers */}
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    🚀 Top Gainers
                  </h3>
                  <div className="space-y-2">
                    <MiniTicker symbol="BTC/USD" price="94,230" change="+4.2%" up />
                    <MiniTicker symbol="NVDA" price="875.40" change="+2.8%" up />
                    <MiniTicker symbol="AAPL" price="178.20" change="+1.3%" up />
                  </div>
                </div>

                {/* Top Losers */}
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    📉 Top Losers
                  </h3>
                  <div className="space-y-2">
                    <MiniTicker symbol="TSLA" price="210.50" change="-1.5%" up={false} />
                    <MiniTicker symbol="EUR/USD" price="1.0850" change="-0.3%" up={false} />
                    <MiniTicker symbol="AMZN" price="195.20" change="-0.8%" up={false} />
                  </div>
                </div>

                {/* Fear & Greed */}
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    😨 Fear & Greed
                  </h3>
                  <div className="p-3 rounded-xl bg-background/60 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Market Sentiment</span>
                      <span className="text-sm font-bold text-warning">72</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: '72%',
                          background: 'linear-gradient(90deg, #22D87A, #F7A83A, #F7574F)',
                          backgroundSize: '200% 100%',
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                      <span>Fear</span>
                      <span className="text-warning font-semibold">Greed</span>
                      <span>Extreme</span>
                    </div>
                  </div>
                </div>

                {/* Sector Performance */}
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    📊 Sector Heatmap
                  </h3>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Technology', val: '+2.4%', up: true },
                      { name: 'Healthcare', val: '+1.1%', up: true },
                      { name: 'Energy', val: '-0.8%', up: false },
                      { name: 'Financials', val: '+0.6%', up: true },
                      { name: 'Consumer', val: '-0.2%', up: false },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                        <span className="text-xs text-muted-foreground">{s.name}</span>
                        <span className={`text-xs font-semibold font-mono ${s.up ? 'text-positive' : 'text-negative'}`}>
                          {s.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
