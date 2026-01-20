-- Migration: Add series_id foreign key to events table and remove series_ticker

-- Step 1: Add series_id column (nullable initially for data migration)
ALTER TABLE events ADD COLUMN IF NOT EXISTS series_id BIGINT REFERENCES series(id) ON DELETE CASCADE;

-- Step 2: Migrate existing data - populate series_id from series table using series_ticker
UPDATE events e
SET series_id = s.id
FROM series s
WHERE e.series_ticker = s.series_ticker;

-- Step 3: Make series_id NOT NULL now that data is migrated
ALTER TABLE events ALTER COLUMN series_id SET NOT NULL;

-- Step 4: Drop the old series_ticker column
ALTER TABLE events DROP COLUMN IF EXISTS series_ticker;

-- Step 5: Drop the old index on series_ticker
DROP INDEX IF EXISTS idx_events_series_ticker;

-- Step 6: Create new index on series_id
CREATE INDEX IF NOT EXISTS idx_events_series_id ON events(series_id);
