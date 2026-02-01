import { Paper, Typography, Box } from '@mui/material';
import { Series } from './types';

interface SeriesCardProps {
  series: Series;
}

export default function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        {series.title}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Ticker:</strong> {series.series_ticker}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Category:</strong> {series.category}
        </Typography>
        <Typography variant="body1">
          <strong>ID:</strong> {series.id}
        </Typography>
      </Box>
    </Paper>
  );
}
