"use client";

/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

interface TradingChartProps {
  symbol?: string;
  theme?: "light" | "dark";
  interval?: string;
}

export function TradingChart({ symbol = "BINANCE:BTCUSD", theme = "dark", interval = "D" }: TradingChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerId = `tv_chart_${symbol.replace(/[^a-zA-Z0-9]/g, '')}_${interval}_${Math.random().toString(36).substring(7)}`;

  if (!mounted) return <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse">Loading Chart...</div>;

  return (
    <div className="w-full h-full" id={containerId + "_wrapper"}>
      <AdvancedRealTimeChart 
        symbol={symbol}
        theme={theme}
        interval={interval as any}
        autosize
        timezone="Etc/UTC"
        style="1"
        locale="en"
        enable_publishing={false}
        backgroundColor="#2F2F2F"
        hide_top_toolbar={false}
        hide_legend={false}
        save_image={false}
        container_id={containerId}
      />
    </div>
  );
}
