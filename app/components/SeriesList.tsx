import { Box, Typography } from '@mui/material';
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
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Selected Series ({series.length})
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        {series.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </Box>
    </Box>
  );
}
