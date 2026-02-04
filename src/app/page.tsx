"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MarketOption {
  id: number;
  market_ticker: string;
  title: string | null;
}

interface SnapshotPoint {
  id: number;
  market_id: number;
  timestamp: string;
  yes_bid: number | null;
  yes_ask: number | null;
  last_price_dollars: number | null;
  volume: number | null;
  volume_24h: number | null;
  created_at: string;
}

function formatDateInput(iso: string): string {
  return iso.slice(0, 16);
}

function toISOStartOfDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T00:00:00.000Z`;
}

function toISOEndOfDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T23:59:59.999Z`;
}

export default function Home() {
  const [markets, setMarkets] = useState<MarketOption[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [snapshots, setSnapshots] = useState<SnapshotPoint[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingMarkets(true);
      setError(null);
      try {
        const res = await fetch("/api/markets");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || body.message || `HTTP ${res.status}`);
        }
        const data: MarketOption[] = await res.json();
        if (!cancelled) {
          setMarkets(data);
          if (data.length > 0 && !selectedTicker) {
            setSelectedTicker(data[0].market_ticker);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load markets");
        }
      } finally {
        if (!cancelled) setLoadingMarkets(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    if (!startInput) setStartInput(formatDateInput(toISOStartOfDay(start)));
    if (!endInput) setEndInput(formatDateInput(toISOEndOfDay(end)));
  }, [startInput, endInput]);

  const fetchSnapshots = useCallback(async () => {
    if (!selectedTicker) {
      setError("Please select a market.");
      return;
    }
    const start = startInput ? new Date(startInput) : new Date();
    const end = endInput ? new Date(endInput) : new Date();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Please enter valid start and end dates.");
      return;
    }
    if (start > end) {
      setError("Start date must be before end date.");
      return;
    }
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    setLoadingSnapshots(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/markets/${encodeURIComponent(selectedTicker)}/snapshots?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `HTTP ${res.status}`);
      }
      const data: SnapshotPoint[] = await res.json();
      setSnapshots(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load snapshots");
      setSnapshots([]);
    } finally {
      setLoadingSnapshots(false);
    }
  }, [selectedTicker, startInput, endInput]);

  const chartData = snapshots.map((s) => ({
    time: new Date(s.timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: s.timestamp,
    lastPrice: s.last_price_dollars ?? null,
  }));

  const selectedMarket = markets.find((m) => m.market_ticker === selectedTicker);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Market price explorer
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Select a market and date range to view price history
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="market-select"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Market
            </label>
            <select
              id="market-select"
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              disabled={loadingMarkets}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 disabled:opacity-50"
            >
              {loadingMarkets ? (
                <option value="">Loading markets…</option>
              ) : markets.length === 0 ? (
                <option value="">No markets found</option>
              ) : (
                markets.map((m) => (
                  <option key={m.id} value={m.market_ticker}>
                    {m.market_ticker}
                    {m.title ? ` — ${m.title.slice(0, 40)}${m.title.length > 40 ? "…" : ""}` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex gap-3 flex-wrap items-end">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Start
              </label>
              <input
                id="start-date"
                type="datetime-local"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                End
              </label>
              <input
                id="end-date"
                type="datetime-local"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
              />
            </div>
            <button
              type="button"
              onClick={fetchSnapshots}
              disabled={loadingSnapshots || !selectedTicker}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loadingSnapshots ? "Loading…" : "Load data"}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 text-sm"
          >
            {error}
          </div>
        )}

        <div className="mt-6">
          {chartData.length === 0 && !loadingSnapshots && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center text-zinc-500 dark:text-zinc-400">
              {selectedTicker
                ? "Select a date range and click “Load data” to see the chart."
                : "Select a market and load data to see the chart."}
            </div>
          )}
          {chartData.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 overflow-hidden">
              {selectedMarket?.title && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-2">
                  {selectedMarket.title}
                </p>
              )}
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-zinc-200 dark:stroke-zinc-700"
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      className="text-zinc-600 dark:text-zinc-400"
                    />
                    <YAxis
                      domain={[0, 1]}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                      className="text-zinc-600 dark:text-zinc-400"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--foreground)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) =>
                        value != null ? [`${(value * 100).toFixed(2)}%`, ""] : ["—", ""]
                      }
                      labelFormatter={(
                        _label: string,
                        payload: Array<{ payload?: { timestamp?: string } }>
                      ) =>
                        payload?.[0]?.payload?.timestamp
                          ? new Date(payload[0].payload.timestamp).toLocaleString()
                          : ""
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="lastPrice"
                      name="Last price"
                      stroke="hsl(220 70% 50%)"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
