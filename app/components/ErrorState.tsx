import { Alert } from '@mui/material';

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      Error: {message}
    </Alert>
  );
}
