'use client';

import { useState, useRef, useEffect } from 'react';
import { Series } from './types';

interface SeriesSelectorProps {
  series: Series[];
  selectedSeries: Series[];
  onSelectionChange: (selected: Series[]) => void;
  loading?: boolean;
}

export default function SeriesSelector({
  series,
  selectedSeries,
  onSelectionChange,
  loading = false,
}: SeriesSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        open &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filteredSeries = series.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.series_ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSeries = (seriesItem: Series) => {
    const isSelected = selectedSeries.some((s) => s.id === seriesItem.id);
    if (isSelected) {
      onSelectionChange(selectedSeries.filter((s) => s.id !== seriesItem.id));
    } else {
      onSelectionChange([...selectedSeries, seriesItem]);
    }
  };

  const isSelected = (seriesItem: Series) => {
    return selectedSeries.some((s) => s.id === seriesItem.id);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading || series.length === 0}
        className="w-full rounded-lg border border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2 text-left text-sm hover:border-zinc-600 dark:hover:border-zinc-400 disabled:opacity-50 flex items-center justify-between"
      >
        <span>
          {selectedSeries.length > 0
            ? `Select Series (${selectedSeries.length} selected)`
            : 'Select Series'}
        </span>
        <span className="text-zinc-500" aria-hidden>▼</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full mt-1 z-10 w-full min-w-[300px] max-h-[400px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg flex flex-col overflow-hidden"
        >
          <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
            <input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
              autoFocus
            />
          </div>
          <ul className="max-h-[300px] overflow-auto py-1">
            {filteredSeries.map((s) => {
              const selected = isSelected(s);
              return (
                <li key={s.id}>
                  <label className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleToggleSeries(s)}
                      className="rounded border-zinc-400"
                    />
                    <span>{s.title} ({s.series_ticker})</span>
                  </label>
                </li>
              );
            })}
            {filteredSeries.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No series found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
