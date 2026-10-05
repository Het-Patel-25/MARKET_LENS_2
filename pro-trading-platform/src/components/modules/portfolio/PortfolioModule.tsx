"use client";

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  DollarSign,
  BarChart2,
  PieChart,
  X,
} from 'lucide-react';
import { useDashboardStore, PortfolioPosition } from '@/store/useDashboardStore';

/* ─── HELPERS ─────────────────────────────────────── */
const pnl = (pos: PortfolioPosition) =>
  (pos.currentPrice - pos.avgBuyPrice) * pos.quantity;

const pnlPct = (pos: PortfolioPosition) =>
  ((pos.currentPrice - pos.avgBuyPrice) / pos.avgBuyPrice) * 100;

const totalValue = (positions: PortfolioPosition[]) =>
  positions.reduce((acc, p) => acc + p.currentPrice * p.quantity, 0);

const totalCost = (positions: PortfolioPosition[]) =>
  positions.reduce((acc, p) => acc + p.avgBuyPrice * p.quantity, 0);

const fmt = (n: number, decimals = 2) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

/* ─── ALLOCATION CHART ───────────────────────────── */
const COLORS = ['#4F8EF7', '#22D87A', '#F7A83A', '#F7574F', '#A855F7', '#06B6D4', '#EC4899'];

function AllocationChart({ positions }: { positions: PortfolioPosition[] }) {
  const total = totalValue(positions);
  if (total === 0) return null;

  const segments = positions.map((p, i) => ({
    label: p.symbol,
    value: (p.currentPrice * p.quantity),
    pct: (p.currentPrice * p.quantity / total) * 100,
    color: COLORS[i % COLORS.length],
  }));

  // Build conic-gradient stops
  let cumulative = 0;
  const stops = segments.map(s => {
    const start = cumulative;
    cumulative += s.pct;
    return `${s.color} ${start.toFixed(1)}% ${cumulative.toFixed(1)}%`;
  });

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0 w-36 h-36">
        <div
          className="w-36 h-36 rounded-full donut-chart"
          style={{
            background: `conic-gradient(${stops.join(', ')})`,
          }}
        />
        {/* Hole */}
        <div className="absolute inset-5 rounded-full bg-card flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-sm font-bold font-mono">${(total / 1000).toFixed(1)}k</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-muted-foreground flex-1 truncate">{s.label}</span>
            <span className="text-xs font-semibold font-mono">{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ADD POSITION MODAL ─────────────────────────── */
function AddPositionModal({ onClose }: { onClose: () => void }) {
  const { addPosition } = useDashboardStore();
  const [form, setForm] = useState({
    symbol: '',
    name: '',
    quantity: '',
    avgBuyPrice: '',
    currentPrice: '',
    category: 'Stocks' as PortfolioPosition['category'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol || !form.quantity || !form.avgBuyPrice) return;
    addPosition({
      symbol: form.symbol.toUpperCase(),
      name: form.name || form.symbol.toUpperCase(),
      quantity: parseFloat(form.quantity),
      avgBuyPrice: parseFloat(form.avgBuyPrice),
      currentPrice: parseFloat(form.currentPrice || form.avgBuyPrice),
      category: form.category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold">Add Position</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Symbol *</label>
              <input value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                placeholder="e.g. AAPL" className="input-field" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Apple Inc." className="input-field" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Quantity *</label>
              <input type="number" step="any" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="10" className="input-field" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Avg Buy Price *</label>
              <input type="number" step="any" value={form.avgBuyPrice} onChange={e => setForm(f => ({ ...f, avgBuyPrice: e.target.value }))}
                placeholder="150.00" className="input-field" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Current Price</label>
              <input type="number" step="any" value={form.currentPrice} onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))}
                placeholder="Same as buy price" className="input-field" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}
                className="input-field">
                <option>Stocks</option>
                <option>Crypto</option>
                <option>Forex</option>
                <option>ETF</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Add Position</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── PORTFOLIO MODULE ───────────────────────────── */
export function PortfolioModule() {
  const { portfolio, removePosition, setActiveSymbol, setActiveTab } = useDashboardStore();
  const [showAdd, setShowAdd] = useState(false);
  const [sortBy, setSortBy] = useState<'pnl' | 'value' | 'pct'>('value');

  const totalVal = totalValue(portfolio);
  const totalCostBasis = totalCost(portfolio);
  const totalPnL = totalVal - totalCostBasis;
  const totalPnLPct = ((totalVal - totalCostBasis) / totalCostBasis) * 100;

  const sorted = useMemo(() => {
    return [...portfolio].sort((a, b) => {
      if (sortBy === 'pnl') return Math.abs(pnl(b)) - Math.abs(pnl(a));
      if (sortBy === 'value') return b.currentPrice * b.quantity - a.currentPrice * a.quantity;
      if (sortBy === 'pct') return Math.abs(pnlPct(b)) - Math.abs(pnlPct(a));
      return 0;
    });
  }, [portfolio, sortBy]);

  const categoryGroups = useMemo(() => {
    const map: Record<string, number> = {};
    portfolio.forEach(p => {
      map[p.category] = (map[p.category] || 0) + p.currentPrice * p.quantity;
    });
    return map;
  }, [portfolio]);

  return (
    <div className="flex flex-col h-full gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{portfolio.length} positions</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Position
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Value', value: fmtUSD(totalVal), sub: 'Portfolio value', icon: <DollarSign />, color: 'text-foreground' },
          { label: 'Total P&L', value: fmtUSD(totalPnL), sub: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%`, icon: totalPnL >= 0 ? <TrendingUp /> : <TrendingDown />, color: totalPnL >= 0 ? 'text-positive' : 'text-negative' },
          { label: 'Cost Basis', value: fmtUSD(totalCostBasis), sub: 'Total invested', icon: <BarChart2 />, color: 'text-muted-foreground' },
          { label: 'Positions', value: portfolio.length.toString(), sub: `${Object.keys(categoryGroups).join(', ')}`, icon: <PieChart />, color: 'text-primary' },
        ].map(card => (
          <div key={card.label} className="metric-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</span>
              <span className={`${card.color} opacity-60`}>{React.cloneElement(card.icon, { className: 'w-4 h-4' })}</span>
            </div>
            <div className={`text-xl font-bold font-mono ${card.color}`}>{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Content: Table + Chart */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Table */}
        <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
          {/* Table controls */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Holdings</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by:</span>
              {[['value', 'Value'], ['pnl', 'P&L $'], ['pct', 'P&L %']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSortBy(val as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    sortBy === val ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">Symbol</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Avg Cost</th>
                  <th className="text-right">Current</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">P&L</th>
                  <th className="text-right">P&L %</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(pos => {
                  const gain = pnl(pos);
                  const gainPct = pnlPct(pos);
                  const isUp = gain >= 0;
                  return (
                    <tr key={pos.id}>
                      <td>
                        <button
                          onClick={() => { setActiveSymbol(pos.symbol); setActiveTab('Dashboard'); }}
                          className="flex flex-col text-left hover:text-primary transition-colors"
                        >
                          <span className="font-bold text-sm">{pos.symbol}</span>
                          <span className="text-xs text-muted-foreground">{pos.name}</span>
                        </button>
                      </td>
                      <td className="text-right font-mono text-sm">{pos.quantity}</td>
                      <td className="text-right font-mono text-sm">${fmt(pos.avgBuyPrice)}</td>
                      <td className="text-right font-mono text-sm font-medium">${fmt(pos.currentPrice)}</td>
                      <td className="text-right font-mono text-sm font-semibold">{fmtUSD(pos.currentPrice * pos.quantity)}</td>
                      <td className={`text-right font-mono text-sm font-semibold ${isUp ? 'text-positive' : 'text-negative'}`}>
                        {isUp ? '+' : ''}{fmtUSD(gain)}
                      </td>
                      <td className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                          isUp ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'
                        }`}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {gainPct.toFixed(2)}%
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => removePosition(pos.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-negative hover:bg-negative/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel: chart + stats */}
        <div className="w-64 shrink-0 flex flex-col gap-4 hidden xl:flex">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Allocation</h3>
            <AllocationChart positions={portfolio} />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Category</h3>
            <div className="space-y-2.5">
              {Object.entries(categoryGroups).map(([cat, val], i) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground">{cat}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold font-mono">{fmtUSD(val)}</div>
                    <div className="text-[10px] text-muted-foreground">{((val / totalVal) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAdd && <AddPositionModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
