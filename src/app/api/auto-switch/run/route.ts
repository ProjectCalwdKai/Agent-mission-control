/**
 * API Route: Run Auto-Switch Monitor
 * 
 * POST /api/auto-switch/run
 * Triggers a single auto-switch check (manual or from cron)
 * 
 * GET /api/auto-switch/run
 * Returns current monitor status
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitorAndAutoSwitch } from '@/lib/auto-switch';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { highThreshold, criticalThreshold, checkAll } = body;

    const result = await monitorAndAutoSwitch({
      highTokenThreshold: highThreshold,
      criticalTokenThreshold: criticalThreshold,
    });

    if (result.error) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      checked: result.checked,
      switched: result.switched,
      message: `Checked ${result.checked} threads, switched ${result.switched}`
    });
  } catch (error: any) {
    console.error('Auto-switch run failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return monitor configuration and last run info
  return NextResponse.json({
    status: 'available',
    config: {
      highThreshold: 80000,
      criticalThreshold: 100000,
      defaultInterval: '5m'
    },
    endpoints: {
      run: 'POST /api/auto-switch/run',
      start: 'POST /api/auto-switch/start (future)',
      stop: 'POST /api/auto-switch/stop (future)'
    }
  });
}
