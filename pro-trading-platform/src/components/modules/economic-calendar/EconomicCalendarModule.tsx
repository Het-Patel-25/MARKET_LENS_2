"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Star,
  ChevronDown,
  ChevronUp,
  Bell,
} from 'lucide-react';

/* ─── TYPES ──────────────────────────────────────── */
type Impact = 'High' | 'Medium' | 'Low';
type ViewMode = 'week' | 'day';

interface EconomicEvent {
  id: string;
  datetime: Date;
  country: string;
  countryCode: string;
  flag: string;
  event: string;
  impact: Impact;
  currency: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  description: string;
  category: string;
}

/* ─── MOCK DATA ──────────────────────────────────── */
function generateEvents(): EconomicEvent[] {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const mkDate = (dayOffset: number, hour: number, min = 0) => {
    const d = new Date(base);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  return [
    // TODAY (day 0)
    {
      id: 'e1', datetime: mkDate(0, 8, 30), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'Initial Jobless Claims', impact: 'High', currency: 'USD',
      actual: '215K', forecast: '220K', previous: '223K',
      description: 'The number of people filing first-time unemployment claims. A lower-than-expected figure is positive for USD.',
      category: 'Employment',
    },
    {
      id: 'e2', datetime: mkDate(0, 10, 0), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'CPI m/m', impact: 'High', currency: 'USD',
      actual: null, forecast: '0.3%', previous: '0.2%',
      description: 'Consumer Price Index measures the change in the price of goods and services. Higher CPI is hawkish for the Fed.',
      category: 'Inflation',
    },
    {
      id: 'e3', datetime: mkDate(0, 9, 0), country: 'Eurozone', countryCode: 'EU',
      flag: '🇪🇺', event: 'ECB Interest Rate Decision', impact: 'High', currency: 'EUR',
      actual: null, forecast: '4.50%', previous: '4.50%',
      description: 'The European Central Bank announces its benchmark interest rate. Unexpected changes cause large EUR moves.',
      category: 'Central Bank',
    },
    {
      id: 'e4', datetime: mkDate(0, 7, 0), country: 'United Kingdom', countryCode: 'GB',
      flag: '🇬🇧', event: 'GDP m/m', impact: 'High', currency: 'GBP',
      actual: '0.2%', forecast: '0.1%', previous: '-0.1%',
      description: 'Monthly GDP measures the change in the value of all goods and services produced by the economy.',
      category: 'Growth',
    },
    {
      id: 'e5', datetime: mkDate(0, 6, 30), country: 'Germany', countryCode: 'DE',
      flag: '🇩🇪', event: 'CPI y/y', impact: 'Medium', currency: 'EUR',
      actual: '2.4%', forecast: '2.5%', previous: '2.6%',
      description: 'German Consumer Price Index year-over-year. Largest Eurozone economy, influential for ECB policy.',
      category: 'Inflation',
    },
    {
      id: 'e6', datetime: mkDate(0, 4, 30), country: 'Japan', countryCode: 'JP',
      flag: '🇯🇵', event: 'BOJ Core CPI y/y', impact: 'Medium', currency: 'JPY',
      actual: '2.1%', forecast: '2.0%', previous: '1.9%',
      description: 'Bank of Japan preferred inflation measure excluding fresh food prices.',
      category: 'Inflation',
    },
    {
      id: 'e7', datetime: mkDate(0, 14, 0), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'Fed Chair Powell Speech', impact: 'High', currency: 'USD',
      actual: null, forecast: null, previous: null,
      description: 'Federal Reserve Chair Jerome Powell speaks. Market sensitive to any hints about future rate policy.',
      category: 'Central Bank',
    },
    {
      id: 'e8', datetime: mkDate(0, 11, 30), country: 'Canada', countryCode: 'CA',
      flag: '🇨🇦', event: 'Core Retail Sales m/m', impact: 'Medium', currency: 'CAD',
      actual: null, forecast: '0.4%', previous: '0.2%',
      description: 'Change in the total value of sales at the retail level, excluding automobiles.',
      category: 'Consumer',
    },

    // TOMORROW (day 1)
    {
      id: 'e9', datetime: mkDate(1, 8, 30), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'Non-Farm Payrolls', impact: 'High', currency: 'USD',
      actual: null, forecast: '185K', previous: '177K',
      description: 'NFP measures the change in the number of employed people. One of the most market-moving events of the month.',
      category: 'Employment',
    },
    {
      id: 'e10', datetime: mkDate(1, 8, 30), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'Unemployment Rate', impact: 'High', currency: 'USD',
      actual: null, forecast: '3.7%', previous: '3.8%',
      description: 'Percentage of the total work force that is unemployed and actively seeking employment.',
      category: 'Employment',
    },
    {
      id: 'e11', datetime: mkDate(1, 7, 0), country: 'United Kingdom', countryCode: 'GB',
      flag: '🇬🇧', event: 'BoE Interest Rate Decision', impact: 'High', currency: 'GBP',
      actual: null, forecast: '5.25%', previous: '5.25%',
      description: 'Bank of England benchmark interest rate. Critical for GBP direction.',
      category: 'Central Bank',
    },
    {
      id: 'e12', datetime: mkDate(1, 9, 0), country: 'Eurozone', countryCode: 'EU',
      flag: '🇪🇺', event: 'Retail Sales m/m', impact: 'Medium', currency: 'EUR',
      actual: null, forecast: '0.3%', previous: '0.1%',
      description: 'Change in the total value of sales at the retail level in the Eurozone.',
      category: 'Consumer',
    },
    {
      id: 'e13', datetime: mkDate(1, 4, 0), country: 'Australia', countryCode: 'AU',
      flag: '🇦🇺', event: 'RBA Rate Statement', impact: 'Medium', currency: 'AUD',
      actual: null, forecast: null, previous: null,
      description: 'Reserve Bank of Australia release their rate statement. Provides guidance on monetary policy direction.',
      category: 'Central Bank',
    },
    {
      id: 'e14', datetime: mkDate(1, 6, 0), country: 'China', countryCode: 'CN',
      flag: '🇨🇳', event: 'Trade Balance', impact: 'Medium', currency: 'CNY',
      actual: null, forecast: '68.5B', previous: '58.9B',
      description: 'Difference in value between imported and exported goods. Surplus indicates more exports than imports.',
      category: 'Trade',
    },

    // Day after tomorrow (day 2)
    {
      id: 'e15', datetime: mkDate(2, 10, 0), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'Core PPI m/m', impact: 'Medium', currency: 'USD',
      actual: null, forecast: '0.2%', previous: '0.3%',
      description: 'Producer Price Index excluding food and energy. Leads to consumer inflation.',
      category: 'Inflation',
    },
    {
      id: 'e16', datetime: mkDate(2, 14, 0), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'FOMC Meeting Minutes', impact: 'High', currency: 'USD',
      actual: null, forecast: null, previous: null,
      description: 'Detailed record of the Fed\'s most recent meeting. Provides insight into future policy decisions.',
      category: 'Central Bank',
    },
    {
      id: 'e17', datetime: mkDate(2, 7, 0), country: 'Germany', countryCode: 'DE',
      flag: '🇩🇪', event: 'Industrial Production m/m', impact: 'Medium', currency: 'EUR',
      actual: null, forecast: '-0.3%', previous: '-0.5%',
      description: 'Change in total inflation-adjusted value of output from manufacturing, mining, and utilities.',
      category: 'Production',
    },

    // Next week events
    {
      id: 'e18', datetime: mkDate(5, 8, 30), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'Retail Sales m/m', impact: 'High', currency: 'USD',
      actual: null, forecast: '0.5%', previous: '0.7%',
      description: 'Change in the total value of sales at the retail level. Strong proxy for consumer spending.',
      category: 'Consumer',
    },
    {
      id: 'e19', datetime: mkDate(5, 10, 0), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'Michigan Consumer Sentiment', impact: 'Medium', currency: 'USD',
      actual: null, forecast: '69.4', previous: '68.2',
      description: 'Survey of consumer confidence in economic activity. Higher readings are positive for USD.',
      category: 'Sentiment',
    },
    {
      id: 'e20', datetime: mkDate(6, 5, 0), country: 'Japan', countryCode: 'JP',
      flag: '🇯🇵', event: 'BOJ Monetary Policy Statement', impact: 'High', currency: 'JPY',
      actual: null, forecast: null, previous: null,
      description: 'Bank of Japan monetary policy statement. JPY sensitive to any hints about policy normalization.',
      category: 'Central Bank',
    },
    {
      id: 'e21', datetime: mkDate(3, 9, 30), country: 'Eurozone', countryCode: 'EU',
      flag: '🇪🇺', event: 'Flash Manufacturing PMI', impact: 'Medium', currency: 'EUR',
      actual: null, forecast: '44.5', previous: '44.2',
      description: 'Purchasing Managers Index flash estimate. Below 50 indicates contraction.',
      category: 'PMI',
    },
    {
      id: 'e22', datetime: mkDate(3, 14, 30), country: 'United States', countryCode: 'US',
      flag: '🇺🇸', event: 'Crude Oil Inventories', impact: 'Low', currency: 'USD',
      actual: null, forecast: '-2.1M', previous: '-1.6M',
      description: 'Change in number of barrels held in inventory by commercial firms. Affects WTI crude oil prices.',
      category: 'Energy',
    },
    {
      id: 'e23', datetime: mkDate(4, 3, 30), country: 'Australia', countryCode: 'AU',
      flag: '🇦🇺', event: 'Employment Change', impact: 'High', currency: 'AUD',
      actual: null, forecast: '30.1K', previous: '47.5K',
      description: 'Change in the number of employed people. AUD heavily influenced by employment data.',
      category: 'Employment',
    },
    {
      id: 'e24', datetime: mkDate(4, 8, 30), country: 'Canada', countryCode: 'CA',
      flag: '🇨🇦', event: 'CPI m/m', impact: 'High', currency: 'CAD',
      actual: null, forecast: '0.1%', previous: '-0.3%',
      description: 'Canadian Consumer Price Index. Key driver of Bank of Canada rate decisions.',
      category: 'Inflation',
    },
  ];
}

/* ─── HELPERS ─────────────────────────────────────── */
const COUNTRIES = ['All', 'US', 'EU', 'GB', 'JP', 'CN', 'DE', 'CA', 'AU'];
const IMPACTS: Impact[] = ['High', 'Medium', 'Low'];
const CATEGORIES = ['All', 'Central Bank', 'Employment', 'Inflation', 'Growth', 'Consumer', 'Trade', 'PMI', 'Sentiment', 'Production', 'Energy'];

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

function getWeekDays(referenceDate: Date): Date[] {
  const days: Date[] = [];
  const d = new Date(referenceDate);
  const dow = d.getDay(); // 0=Sun
  const mon = new Date(d);
  mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  for (let i = 0; i < 7; i++) {
    const day = new Date(mon);
    day.setDate(mon.getDate() + i);
    days.push(day);
  }
  return days;
}

function ActualVsForecast({ actual, forecast, previous }: { actual: string | null; forecast: string | null; previous: string | null }) {
  if (!forecast && !actual && !previous) {
    return <span className="text-xs text-muted-foreground italic">Speech / Statement</span>;
  }

  const isPositive = actual && forecast &&
    parseFloat(actual) > parseFloat(forecast);
  const isNegative = actual && forecast &&
    parseFloat(actual) < parseFloat(forecast);

  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      {actual !== null ? (
        <span className={`font-bold ${isPositive ? 'text-positive' : isNegative ? 'text-negative' : 'text-foreground'}`}>
          {actual}
          {isPositive && <TrendingUp className="inline w-3 h-3 ml-1" />}
          {isNegative && <TrendingDown className="inline w-3 h-3 ml-1" />}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
      {forecast && (
        <span className="text-muted-foreground">
          F: <span className="text-foreground">{forecast}</span>
        </span>
      )}
      {previous && (
        <span className="text-muted-foreground">
          P: {previous}
        </span>
      )}
    </div>
  );
}

function ImpactBadge({ impact }: { impact: Impact }) {
  const cfg = {
    High: { cls: 'badge-high', icon: '🔴', dot: 'bg-negative' },
    Medium: { cls: 'badge-medium', icon: '🟡', dot: 'bg-warning' },
    Low: { cls: 'badge-low', icon: '🟢', dot: 'bg-positive' },
  };
  const { cls, dot } = cfg[impact];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {impact}
    </span>
  );
}

/* ─── EVENT DETAIL PANEL ─────────────────────────── */
function EventDetailPanel({ event, onClose }: { event: EconomicEvent; onClose: () => void }) {
  return (
    <div className="animate-slide-in-right h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Event Detail</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/5">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div className="p-4 rounded-xl bg-background/60 border border-border">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{event.flag}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm leading-tight">{event.event}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{event.country} · {event.currency}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ImpactBadge impact={event.impact} />
            <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-md text-muted-foreground">{event.category}</span>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{formatDate(event.datetime)} at {formatTime(event.datetime)}</span>
        </div>

        {/* Data */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Actual', value: event.actual, isActual: true },
            { label: 'Forecast', value: event.forecast, isActual: false },
            { label: 'Previous', value: event.previous, isActual: false },
          ].map(({ label, value, isActual }) => {
            const isPosActual = isActual && event.actual && event.forecast &&
              parseFloat(event.actual) > parseFloat(event.forecast);
            const isNegActual = isActual && event.actual && event.forecast &&
              parseFloat(event.actual) < parseFloat(event.forecast);
            return (
              <div key={label} className={`p-3 rounded-xl border text-center ${isActual && value ? 'gradient-border' : 'border-border bg-background/50'}`}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
                <div className={`font-mono font-bold text-base ${isPosActual ? 'text-positive' : isNegActual ? 'text-negative' : value ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {value ?? '—'}
                </div>
                {isActual && isPosActual && <TrendingUp className="w-3 h-3 text-positive mx-auto mt-1" />}
                {isActual && isNegActual && <TrendingDown className="w-3 h-3 text-negative mx-auto mt-1" />}
                {isActual && !isPosActual && !isNegActual && value && <Minus className="w-3 h-3 text-muted-foreground mx-auto mt-1" />}
              </div>
            );
          })}
        </div>

        {/* Description */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
          <h5 className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">About this indicator</h5>
          <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
        </div>

        {/* Set Alert Button */}
        <button className="btn-primary w-full flex items-center justify-center gap-2">
          <Bell className="w-4 h-4" />
          Set Reminder
        </button>
      </div>
    </div>
  );
}

/* ─── COUNTDOWN TIMER ────────────────────────────── */
function NextEventCountdown({ events }: { events: EconomicEvent[] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const upcoming = events
    .filter((e) => e.datetime > now && e.impact === 'High')
    .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())[0];

  if (!upcoming) return null;

  const diff = Math.max(0, upcoming.datetime.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-destructive/5 border border-destructive/20">
      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">Next high-impact event</p>
        <p className="text-sm font-semibold truncate">{upcoming.flag} {upcoming.event}</p>
      </div>
      <div className="font-mono text-sm font-bold text-destructive shrink-0 tabular-nums">
        {h > 0 ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, '0')}s`}
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────── */
export function EconomicCalendarModule() {
  const [events] = useState<EconomicEvent[]>(generateEvents);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['All']);
  const [selectedImpacts, setSelectedImpacts] = useState<Impact[]>(['High', 'Medium', 'Low']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const navigateWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  };

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchCountry = selectedCountries.includes('All') || selectedCountries.includes(e.countryCode);
      const matchImpact = selectedImpacts.includes(e.impact);
      const matchCategory = selectedCategory === 'All' || e.category === selectedCategory;
      const matchDate = viewMode === 'week'
        ? weekDays.some((d) => isSameDay(d, e.datetime))
        : isSameDay(selectedDate, e.datetime);
      return matchCountry && matchImpact && matchCategory && matchDate;
    });
  }, [events, selectedCountries, selectedImpacts, selectedCategory, viewMode, weekDays, selectedDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EconomicEvent[]>();
    const days = viewMode === 'week' ? weekDays : [selectedDate];
    days.forEach((d) => {
      const key = d.toDateString();
      map.set(key, filteredEvents.filter((e) => isSameDay(e.datetime, d)));
    });
    return map;
  }, [filteredEvents, weekDays, selectedDate, viewMode]);

  const toggleCountry = (c: string) => {
    if (c === 'All') {
      setSelectedCountries(['All']);
      return;
    }
    setSelectedCountries((prev) => {
      const withoutAll = prev.filter((x) => x !== 'All');
      if (withoutAll.includes(c)) {
        const next = withoutAll.filter((x) => x !== c);
        return next.length === 0 ? ['All'] : next;
      }
      return [...withoutAll, c];
    });
  };

  const toggleImpact = (imp: Impact) => {
    setSelectedImpacts((prev) =>
      prev.includes(imp)
        ? prev.length > 1 ? prev.filter((x) => x !== imp) : prev
        : [...prev, imp]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const now = new Date();
  const highImpactCount = filteredEvents.filter((e) => e.impact === 'High').length;
  const releasedCount = filteredEvents.filter((e) => e.actual !== null).length;

  return (
    <div className="flex h-full gap-4 min-h-0 animate-fade-in">
      {/* ── MAIN CALENDAR AREA ── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Economic Calendar</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredEvents.length} events · {highImpactCount} high-impact · {releasedCount} released
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-card border border-border rounded-xl p-1 gap-1">
              {(['week', 'day'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    viewMode === mode
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                showFilters ? 'bg-primary/10 border-primary/40 text-primary' : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
            <button className="p-2 rounded-xl border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 rounded-xl bg-card border border-border space-y-4 animate-fade-in">
            {/* Countries */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Countries / Regions</label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCountry(c)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      selectedCountries.includes(c)
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {/* Impact */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Impact Level</label>
              <div className="flex gap-2">
                {IMPACTS.map((imp) => (
                  <button
                    key={imp}
                    onClick={() => toggleImpact(imp)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedImpacts.includes(imp)
                        ? imp === 'High' ? 'badge-high' : imp === 'Medium' ? 'badge-medium' : 'badge-low'
                        : 'border-border text-muted-foreground opacity-50 hover:opacity-100'
                    }`}
                  >
                    {imp === 'High' ? '🔴' : imp === 'Medium' ? '🟡' : '🟢'} {imp}
                  </button>
                ))}
              </div>
            </div>
            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Countdown */}
        <div className="mb-4">
          <NextEventCountdown events={events} />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)}
            className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all border border-border"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {viewMode === 'week' ? (
              weekDays.map((d) => (
                <button
                  key={d.toDateString()}
                  onClick={() => { setSelectedDate(d); setViewMode('day'); }}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all ${
                    isSameDay(d, now)
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : isSameDay(d, selectedDate)
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="font-semibold">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-base font-bold mt-0.5">{d.getDate()}</span>
                  {/* Event count dot */}
                  {(() => {
                    const count = filteredEvents.filter(e => isSameDay(e.datetime, d)).length;
                    const hasHigh = filteredEvents.some(e => isSameDay(e.datetime, d) && e.impact === 'High');
                    return count > 0 ? (
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full ${hasHigh ? 'bg-destructive' : 'bg-primary/60'}`} />
                    ) : <span className="mt-1 w-1.5 h-1.5" />;
                  })()}
                </button>
              ))
            ) : (
              <span className="text-sm font-semibold">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          <button
            onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateDay(1)}
            className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all border border-border"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {(viewMode === 'week' ? weekDays : [selectedDate]).map((day) => {
            const dayEvents = eventsByDay.get(day.toDateString()) || [];
            if (dayEvents.length === 0 && viewMode === 'week') return null;

            return (
              <div key={day.toDateString()}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex items-center gap-2 ${isSameDay(day, now) ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {isSameDay(day, now) ? 'Today — ' : ''}{formatDate(day)}
                    </span>
                  </div>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {dayEvents.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-sm rounded-xl border border-border/50 bg-card/30">
                    No events scheduled
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {dayEvents
                      .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
                      .map((event) => {
                        const isExpanded = expandedEvents.has(event.id);
                        const isPast = event.datetime < now;
                        const isActive = !isPast && event.datetime.getTime() - now.getTime() < 3600000;

                        return (
                          <div
                            key={event.id}
                            className={`rounded-xl border transition-all duration-200 overflow-hidden
                              calendar-event-row ${event.impact === 'High' ? 'high-impact' : event.impact === 'Medium' ? 'medium-impact' : 'low-impact'}
                              ${selectedEvent?.id === event.id ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/60'}
                              ${isPast ? 'opacity-70' : ''}
                              ${isActive ? 'ring-1 ring-warning/40' : ''}
                            `}
                          >
                            {/* Main row */}
                            <div
                              className="flex items-center gap-3 p-3 cursor-pointer"
                              onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                            >
                              {/* Time */}
                              <div className="text-xs font-mono text-muted-foreground shrink-0 w-16 text-right">
                                {formatTime(event.datetime)}
                              </div>

                              {/* Flag + Impact */}
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-lg">{event.flag}</span>
                              </div>

                              {/* Event name */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold text-sm truncate ${isActive ? 'text-warning' : ''}`}>
                                    {event.event}
                                  </span>
                                  {isActive && (
                                    <span className="shrink-0 text-[10px] font-bold bg-warning/20 text-warning px-2 py-0.5 rounded-full animate-pulse">
                                      UPCOMING
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{event.country} · {event.currency}</div>
                              </div>

                              {/* Impact badge */}
                              <ImpactBadge impact={event.impact} />

                              {/* Actual/Forecast */}
                              <div className="hidden md:block w-44">
                                <ActualVsForecast
                                  actual={event.actual}
                                  forecast={event.forecast}
                                  previous={event.previous}
                                />
                              </div>

                              {/* Expand toggle */}
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleExpand(event.id); }}
                                className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all shrink-0"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>

                            {/* Expanded Detail */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-1 border-t border-border/50 animate-fade-in">
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                  {[
                                    { label: 'Actual', value: event.actual },
                                    { label: 'Forecast', value: event.forecast },
                                    { label: 'Previous', value: event.previous },
                                  ].map(({ label, value }) => (
                                    <div key={label} className="p-3 rounded-xl bg-background/60 border border-border text-center">
                                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
                                      <div className={`font-mono font-bold text-base ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {value ?? '—'}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
                                <div className="mt-3 flex gap-2">
                                  <span className="text-xs bg-secondary/50 px-2 py-1 rounded-md text-muted-foreground">{event.category}</span>
                                  <button
                                    className="text-xs flex items-center gap-1 text-primary hover:text-primary/80"
                                    onClick={() => setSelectedEvent(event)}
                                  >
                                    <Star className="w-3 h-3" /> Full detail →
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT DETAIL PANEL ── */}
      {selectedEvent && (
        <div className="w-72 shrink-0 border border-border rounded-xl bg-card overflow-hidden hidden lg:block animate-slide-in-right">
          <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>
      )}

      {/* ── SUMMARY PANEL (when no event selected) ── */}
      {!selectedEvent && (
        <div className="w-64 shrink-0 hidden xl:flex flex-col gap-3">
          {/* Stats */}
          <div className="rounded-xl bg-card border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">This Week</h3>
            <div className="space-y-2">
              {[
                { label: 'Total Events', value: filteredEvents.length, color: 'text-foreground' },
                { label: 'High Impact', value: filteredEvents.filter(e => e.impact === 'High').length, color: 'text-negative' },
                { label: 'Medium Impact', value: filteredEvents.filter(e => e.impact === 'Medium').length, color: 'text-warning' },
                { label: 'Already Released', value: filteredEvents.filter(e => e.actual !== null).length, color: 'text-positive' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's high-impact */}
          <div className="rounded-xl bg-card border border-border p-4 flex-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Today's High Impact</h3>
            <div className="space-y-2">
              {filteredEvents.filter(e => isSameDay(e.datetime, now) && e.impact === 'High').length === 0 ? (
                <p className="text-xs text-muted-foreground">No high-impact events today</p>
              ) : filteredEvents
                .filter(e => isSameDay(e.datetime, now) && e.impact === 'High')
                .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
                .map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    className="w-full text-left p-2.5 rounded-lg bg-background/60 border border-border hover:border-destructive/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{e.flag}</span>
                      <span className="text-xs font-mono text-muted-foreground">{formatTime(e.datetime)}</span>
                    </div>
                    <span className="text-xs font-semibold truncate block">{e.event}</span>
                    {e.actual ? (
                      <span className="text-xs text-positive">Released: {e.actual}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">F: {e.forecast ?? '—'}</span>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Currency coverage */}
          <div className="rounded-xl bg-card border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Currency Coverage</h3>
            <div className="space-y-1.5">
              {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY'].map(cur => {
                const count = filteredEvents.filter(e => e.currency === cur).length;
                const hasHigh = filteredEvents.some(e => e.currency === cur && e.impact === 'High');
                return (
                  <div key={cur} className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold w-8 text-right">{cur}</span>
                    <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${hasHigh ? 'bg-destructive' : 'bg-primary/60'}`}
                        style={{ width: `${Math.min(100, count * 25)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-4">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
