import { Series } from './types';

interface SeriesCardProps {
  series: Series;
}

export default function SeriesCard({ series }: SeriesCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{series.title}</h3>
      <div className="mt-2 space-y-1 text-sm">
        <p><strong>Ticker:</strong> {series.series_ticker}</p>
        <p><strong>Category:</strong> {series.category}</p>
        <p><strong>ID:</strong> {series.id}</p>
      </div>
    </div>
  );
}
