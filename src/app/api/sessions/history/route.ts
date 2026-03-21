/**
 * API Route: Get Session History
 * 
 * GET /api/sessions/history?sessionKey=xxx&limit=50
 */

import { NextRequest, NextResponse } from 'next/server';

const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:8080';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || process.env.OPENCLAW_GATEWAY_TOKEN;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionKey = searchParams.get('sessionKey');
    const limit = searchParams.get('limit') || '50';

    if (!sessionKey) {
      return NextResponse.json(
        { error: 'sessionKey is required' },
        { status: 400 }
      );
    }

    // Call OpenClaw Gateway sessions_history
    const response = await fetch(
      `${OPENCLAW_URL}/api/sessions/history?sessionKey=${sessionKey}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${OPENCLAW_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenClaw history error:', errorText);
      throw new Error(`OpenClaw API error: ${response.status}`);
    }

    const history = await response.json();

    return NextResponse.json(history);
  } catch (error: any) {
    console.error('Session history fetch failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
