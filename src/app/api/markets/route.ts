import { NextResponse } from 'next/server';
import { getAllMarkets } from '@/lib/db/markets';

export async function GET() {
  try {
    const markets = await getAllMarkets();
    return NextResponse.json(markets);
  } catch (error) {
    console.error('Markets API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
