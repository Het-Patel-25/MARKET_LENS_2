"use client";

import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Eye,
  Database,
  Shield,
  Globe,
  Zap,
  Check,
  ChevronRight,
  Info,
  Palette,
} from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';

/* ─── TOGGLE ─────────────────────────────────────── */
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-primary' : 'bg-secondary border border-border'}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${enabled ? 'left-[calc(100%-22px)]' : 'left-0.5'}`}
      />
    </button>
  );
}

/* ─── SECTION ─────────────────────────────────────── */
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <span className="text-primary">{React.cloneElement(icon as any, { className: 'w-4 h-4' })}</span>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

/* ─── ACCENT COLOR PICKER ────────────────────────── */
const ACCENT_COLORS = [
  { name: 'Electric Blue', value: '#4F8EF7', class: 'bg-blue-500' },
  { name: 'Purple', value: '#A855F7', class: 'bg-purple-500' },
  { name: 'Cyan', value: '#06B6D4', class: 'bg-cyan-500' },
  { name: 'Green', value: '#22D87A', class: 'bg-green-500' },
  { name: 'Orange', value: '#F7A83A', class: 'bg-orange-400' },
  { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
];

/* ─── SETTINGS MODULE ────────────────────────────── */
export function SettingsModule() {
  const { sidebarCollapsed, setSidebarCollapsed } = useDashboardStore();

  const [preferences, setPreferences] = useState({
    notifications: true,
    soundAlerts: false,
    compactMode: false,
    animations: true,
    autoRefresh: true,
    showVolume: true,
    showChangePercent: true,
    defaultTimeframe: '1D',
    currency: 'USD',
    timezone: 'UTC',
  });

  const [selectedAccent, setSelectedAccent] = useState('#4F8EF7');
  const [isDark, setIsDark] = useState(true);

  const toggle = (key: keyof typeof preferences) =>
    setPreferences(p => ({ ...p, [key]: !p[key] }));

  const handleThemeToggle = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleAccentColor = (color: string) => {
    setSelectedAccent(color);
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--ring', color);
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--color-primary', color);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5 animate-fade-in pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Customize your MarketLens Pro experience</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance" icon={<Palette />}>
        {/* Theme */}
        <SettingRow
          label="Dark Mode"
          description="Toggle between dark and light themes"
          control={
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Toggle enabled={isDark} onToggle={handleThemeToggle} />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
          }
        />
        {/* Accent Color */}
        <SettingRow
          label="Accent Color"
          description="Primary color used throughout the interface"
          control={
            <div className="flex items-center gap-2">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => handleAccentColor(c.value)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedAccent === c.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {selectedAccent === c.value && (
                    <Check className="w-3 h-3 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          }
        />
        {/* Compact mode */}
        <SettingRow
          label="Compact Mode"
          description="Reduce padding and spacing for more data density"
          control={<Toggle enabled={preferences.compactMode} onToggle={() => toggle('compactMode')} />}
        />
        {/* Animations */}
        <SettingRow
          label="Animations"
          description="Smooth transitions and micro-animations"
          control={<Toggle enabled={preferences.animations} onToggle={() => toggle('animations')} />}
        />
        {/* Sidebar */}
        <SettingRow
          label="Collapsed Sidebar"
          description="Show only icons in the navigation sidebar"
          control={<Toggle enabled={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications & Alerts" icon={<Bell />}>
        <SettingRow
          label="Price Alert Notifications"
          description="Visual notifications when price alerts are triggered"
          control={<Toggle enabled={preferences.notifications} onToggle={() => toggle('notifications')} />}
        />
        <SettingRow
          label="Sound Alerts"
          description="Play a sound when a price alert triggers"
          control={<Toggle enabled={preferences.soundAlerts} onToggle={() => toggle('soundAlerts')} />}
        />
      </Section>

      {/* Display */}
      <Section title="Display Preferences" icon={<Eye />}>
        <SettingRow
          label="Show Volume"
          description="Display trading volume on charts and tables"
          control={<Toggle enabled={preferences.showVolume} onToggle={() => toggle('showVolume')} />}
        />
        <SettingRow
          label="Show Change %"
          description="Show percentage change alongside absolute price change"
          control={<Toggle enabled={preferences.showChangePercent} onToggle={() => toggle('showChangePercent')} />}
        />
        <SettingRow
          label="Default Timeframe"
          description="Default chart interval when opening a symbol"
          control={
            <select
              value={preferences.defaultTimeframe}
              onChange={e => setPreferences(p => ({ ...p, defaultTimeframe: e.target.value }))}
              className="input-field w-20 py-1.5 text-sm"
            >
              {['1m', '5m', '15m', '1H', '4H', '1D', '1W'].map(tf => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          }
        />
        <SettingRow
          label="Display Currency"
          description="Currency for portfolio and P&L values"
          control={
            <select
              value={preferences.currency}
              onChange={e => setPreferences(p => ({ ...p, currency: e.target.value }))}
              className="input-field w-24 py-1.5 text-sm"
            >
              {['USD', 'EUR', 'GBP', 'JPY', 'INR'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          }
        />
        <SettingRow
          label="Timezone"
          description="Time zone for economic calendar and charts"
          control={
            <select
              value={preferences.timezone}
              onChange={e => setPreferences(p => ({ ...p, timezone: e.target.value }))}
              className="input-field w-32 py-1.5 text-sm"
            >
              {['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          }
        />
      </Section>

      {/* Data */}
      <Section title="Data & Performance" icon={<Zap />}>
        <SettingRow
          label="Auto-Refresh"
          description="Automatically refresh market data every 30 seconds"
          control={<Toggle enabled={preferences.autoRefresh} onToggle={() => toggle('autoRefresh')} />}
        />
      </Section>

      {/* API Info */}
      <Section title="API & Data Sources" icon={<Database />}>
        <SettingRow
          label="TradingView API"
          description="Charts and screener widget data"
          control={
            <span className="flex items-center gap-1.5 text-xs text-positive font-medium">
              <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
              Connected
            </span>
          }
        />
        <SettingRow
          label="Backend API"
          description={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'} — Asset screener`}
          control={
            <span className="flex items-center gap-1.5 text-xs text-warning font-medium">
              <span className="w-2 h-2 rounded-full bg-warning" />
              Optional
            </span>
          }
        />
        <SettingRow
          label="News API"
          description="Market news and sentiment data"
          control={
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              Mock data
            </span>
          }
        />
      </Section>

      {/* About */}
      <Section title="About" icon={<Info />}>
        <SettingRow
          label="MarketLens Pro"
          description="Professional trading platform for multi-asset analysis"
          control={<span className="text-xs text-muted-foreground font-mono">v1.0.0</span>}
        />
        <SettingRow
          label="Tech Stack"
          description="Next.js 16, React 19, Tailwind v4, TradingView, Zustand"
          control={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
        />
        <SettingRow
          label="License"
          description="Academic / Educational use"
          control={<span className="text-xs text-muted-foreground">SGP Project</span>}
        />
      </Section>

      {/* Danger Zone */}
      <Section title="Data Management" icon={<Shield />}>
        <SettingRow
          label="Clear Saved Data"
          description="Reset all watchlists, alerts, and portfolio positions to defaults"
          control={
            <button
              onClick={() => {
                if (confirm('Reset all data to defaults? This cannot be undone.')) {
                  localStorage.removeItem('marketlens-dashboard-store');
                  window.location.reload();
                }
              }}
              className="btn-danger"
            >
              Reset Data
            </button>
          }
        />
      </Section>
    </div>
  );
}
