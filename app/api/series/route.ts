import { NextRequest, NextResponse } from 'next/server';
import { getAllSeries } from '@/lib/db/series';

export async function GET(request: NextRequest) {
  try {
    const data = await getAllSeries();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}