'use client';

import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Prediction Market Correlations
        </Typography>
        <IconButton onClick={handleDrawerToggle} size="small">
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {mounted && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <SeriesSelector
            series={series}
            selectedSeries={selectedSeries}
            onSelectionChange={onSelectionChange}
            loading={loading}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {!open && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: open ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
