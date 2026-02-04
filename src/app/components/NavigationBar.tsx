'use client';

import { useState } from 'react';
import { Series } from './types';
import SeriesSelector from './SeriesSelector';

const DRAWER_WIDTH = 350;

interface SidebarProps {
  series: Series[];
  selectedSeries: Series[];
  onSelectionChange: (selected: Series[]) => void;
  loading?: boolean;
  mounted?: boolean;
}

export default function Sidebar({
  series,
  selectedSeries,
  onSelectionChange,
  loading = false,
  mounted = false,
}: SidebarProps) {
  const [open, setOpen] = useState(true);

  const drawerContent = (
    <div
      className="w-full h-full flex flex-col p-4"
      style={{ width: DRAWER_WIDTH }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex-1">Prediction Market Correlations</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
          aria-label="Close sidebar"
        >
          ←
        </button>
      </div>
      <hr className="border-zinc-200 dark:border-zinc-700 mb-4" />
      {mounted && (
        <div className="flex-1 overflow-auto">
          <SeriesSelector
            series={series}
            selectedSeries={selectedSeries}
            onSelectionChange={onSelectionChange}
            loading={loading}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-[1300] p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          aria-label="Open drawer"
        >
          ☰
        </button>
      )}
      <aside
        className={`fixed top-0 left-0 h-full flex-shrink-0 border-r border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 z-[1200] transition-[width] ease-in-out ${
          open ? 'w-[350px]' : 'w-0 overflow-hidden'
        }`}
        style={{ width: open ? DRAWER_WIDTH : 0 }}
      >
        {drawerContent}
      </aside>
    </>
  );
}
