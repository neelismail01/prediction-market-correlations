# Kalshi Sync API Endpoint

## Overview

The `/api/kalshi/sync` endpoint orchestrates fetching active events, markets, and pricing data from Kalshi and storing them in Supabase.

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Kalshi Series Tickers (comma-separated)
KALSHI_SERIES_TICKERS=KXPREZ,KXHIGHNY

# Optional: Override Kalshi API base URL
# KALSHI_API_BASE_URL=https://api.elections.kalshi.com/trade-api/v2
```

## Database Setup

Before using this endpoint, you need to run the database migration:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/migrations/001_initial_schema.sql`

This will create the required tables:
- `events` - Stores event information
- `markets` - Stores market information
- `market_price_snapshots` - Stores historical pricing data

## Usage

```bash
curl "http://localhost:3000/api/kalshi/sync"
```

## Response

The endpoint returns a JSON response with sync statistics:

```json
{
  "success": true,
  "seriesProcessed": 2,
  "eventsFetched": 15,
  "eventsUpserted": 15,
  "marketsFetched": 120,
  "marketsUpserted": 120,
  "snapshotsCreated": 120,
  "errors": []
}
```

If there are partial failures, the endpoint will return HTTP 207 (Multi-Status) and include error details in the `errors` array.

## Cron Job Setup

You can set up a cron job to call this endpoint periodically:

```bash
# Run every 5 minutes
*/5 * * * * curl -X GET "https://your-domain.com/api/kalshi/sync"
```

Or use a service like Vercel Cron Jobs, GitHub Actions, or similar.
