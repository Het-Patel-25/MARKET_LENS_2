"use client";

import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  X,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { useDashboardStore, PriceAlert } from '@/store/useDashboardStore';

/* ─── ADD ALERT MODAL ────────────────────────────── */
function AddAlertModal({ onClose }: { onClose: () => void }) {
  const { addAlert } = useDashboardStore();
  const [form, setForm] = useState({
    symbol: '',
    targetPrice: '',
    direction: 'above' as 'above' | 'below',
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol || !form.targetPrice) return;
    addAlert({
      symbol: form.symbol.toUpperCase(),
      targetPrice: parseFloat(form.targetPrice),
      direction: form.direction,
      note: form.note || undefined,
    });
    onClose();
  };

  const popularSymbols = ['BTC/USD', 'NVDA', 'AAPL', 'MSFT', 'ETH', 'TSLA', 'EUR/USD'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Create Price Alert</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Symbol */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Symbol *</label>
            <input
              value={form.symbol}
              onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
              placeholder="e.g. BTC/USD"
              className="input-field"
              required
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {popularSymbols.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, symbol: s }))}
                  className={`px-2 py-0.5 rounded-md text-xs border transition-all ${
                    form.symbol === s
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Alert when price goes</label>
            <div className="grid grid-cols-2 gap-2">
              {(['above', 'below'] as const).map(dir => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, direction: dir }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                    form.direction === dir
                      ? dir === 'above'
                        ? 'bg-positive/10 border-positive/40 text-positive'
                        : 'bg-negative/10 border-negative/40 text-negative'
                      : 'border-border text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  {dir === 'above' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {dir.charAt(0).toUpperCase() + dir.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Target Price */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Target Price *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                step="any"
                value={form.targetPrice}
                onChange={e => setForm(f => ({ ...f, targetPrice: e.target.value }))}
                placeholder="0.00"
                className="input-field pl-7"
                required
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Note (optional)</label>
            <input
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="e.g. ATH target, support level"
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" />
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── ALERT CARD ─────────────────────────────────── */
function AlertCard({ alert }: { alert: PriceAlert }) {
  const { removeAlert, triggerAlert, setActiveSymbol, setActiveTab } = useDashboardStore();
  const isTriggered = alert.status === 'triggered';

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isTriggered
        ? 'border-positive/20 bg-positive/5 opacity-70'
        : alert.direction === 'above'
          ? 'border-border bg-card hover:border-positive/30'
          : 'border-border bg-card hover:border-negative/30'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isTriggered ? 'bg-positive/15' :
            alert.direction === 'above' ? 'bg-positive/10' : 'bg-negative/10'
          }`}>
            {isTriggered
              ? <CheckCircle className="w-4 h-4 text-positive" />
              : alert.direction === 'above'
                ? <TrendingUp className="w-4 h-4 text-positive" />
                : <TrendingDown className="w-4 h-4 text-negative" />}
          </div>

          <div className="flex-1 min-w-0">
            <button
              onClick={() => { setActiveSymbol(alert.symbol); setActiveTab('Dashboard'); }}
              className="font-bold text-sm hover:text-primary transition-colors"
            >
              {alert.symbol}
            </button>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {alert.direction === 'above' ? '↑ above' : '↓ below'}
              </span>
              <span className={`text-sm font-mono font-bold ${
                alert.direction === 'above' ? 'text-positive' : 'text-negative'
              }`}>
                ${alert.targetPrice.toLocaleString()}
              </span>
            </div>
            {alert.note && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{alert.note}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status Badge */}
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold ${
            isTriggered ? 'bg-positive/10 text-positive' : 'bg-primary/10 text-primary'
          }`}>
            {isTriggered
              ? <><CheckCircle className="w-3 h-3" /> Triggered</>
              : <><Clock className="w-3 h-3" /> Active</>}
          </span>

          {/* Actions */}
          {!isTriggered && (
            <button
              onClick={() => triggerAlert(alert.id)}
              title="Mark as triggered"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-positive hover:bg-positive/10 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => removeAlert(alert.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-negative hover:bg-negative/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Date */}
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> Created {alert.createdAt}
        </span>
        <span className={`w-2 h-2 rounded-full ${isTriggered ? 'bg-positive' : 'bg-primary animate-pulse'}`} />
      </div>
    </div>
  );
}

/* ─── ALERTS MODULE ──────────────────────────────── */
export function AlertsModule() {
  const { alerts } = useDashboardStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('all');

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const triggeredAlerts = alerts.filter(a => a.status === 'triggered');

  const displayedAlerts = alerts.filter(a =>
    filter === 'all' ? true : a.status === filter
  );

  return (
    <div className="flex flex-col h-full gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Price Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeAlerts.length} active · {triggeredAlerts.length} triggered
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Alerts', value: alerts.length, icon: <Bell />, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active', value: activeAlerts.length, icon: <Clock />, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Triggered', value: triggeredAlerts.length, icon: <CheckCircle />, color: 'text-positive', bg: 'bg-positive/10' },
        ].map(card => (
          <div key={card.label} className="metric-card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
              {React.cloneElement(card.icon, { className: `w-5 h-5 ${card.color}` })}
            </div>
            <div>
              <div className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {[['all', 'All'], ['active', 'Active'], ['triggered', 'Triggered']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === val
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      <div className="flex-1 overflow-y-auto">
        {displayedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No alerts yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Create price alerts to get notified when assets hit your target levels.
            </p>
            <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create First Alert
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {displayedAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      {activeAlerts.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 shrink-0">
          <AlertTriangle className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Alerts are visual only and update when you reload the page. Real-time push notifications require backend integration.
          </p>
        </div>
      )}

      {showAdd && <AddAlertModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
