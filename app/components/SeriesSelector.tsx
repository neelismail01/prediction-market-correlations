'use client';

import { useState, useRef } from 'react';
import {
  Button,
  Popover,
  Checkbox,
  TextField,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Series } from './types';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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
    <>
      <Button
        ref={buttonRef}
        variant="outlined"
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        disabled={loading || series.length === 0}
        fullWidth
        sx={{
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'background.paper',
            borderColor: 'primary.main',
            borderWidth: 2,
          },
        }}
      >
        {selectedSeries.length > 0
          ? `Select Series (${selectedSeries.length} selected)`
          : 'Select Series'}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: buttonRef.current?.offsetWidth || 300,
            maxHeight: 400,
            mt: 1,
            ml: -1,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            sx={{ mb: 1 }}
          />
          <List
            sx={{
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            {filteredSeries.map((s) => {
              const selected = isSelected(s);
              return (
                <ListItem key={s.id} disablePadding>
                  <ListItemButton onClick={() => handleToggleSeries(s)} dense>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${s.title} (${s.series_ticker})`}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {filteredSeries.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No series found"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Popover>
    </>
  );
}
