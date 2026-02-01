import { Series } from './types';
import SeriesCard from './SeriesCard';

interface SeriesListProps {
  series: Series[];
}

export default function SeriesList({ series }: SeriesListProps) {
  if (series.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-medium mb-4">Selected Series ({series.length})</h2>
      <div className="flex flex-col gap-4 mt-4">
        {series.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </div>
    </div>
  );
}
