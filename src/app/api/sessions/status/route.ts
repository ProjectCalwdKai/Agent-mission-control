/**
 * API Route: Get Session Status (Token Usage)
 * 
 * GET /api/sessions/status?sessionKey=xxx
 * Returns: { sessionKey, model, tokens: { in, out, total }, status }
 */

import { NextRequest, NextResponse } from 'next/server';

const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:63624';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionKey = searchParams.get('sessionKey');

    if (!sessionKey) {
      return NextResponse.json(
        { error: 'sessionKey is required' },
        { status: 400 }
      );
    }

    // Call OpenClaw Gateway session_status
    // Note: This may need adjustment based on actual OpenClaw API
    const response = await fetch(
      `${OPENCLAW_URL}/api/sessions/status?sessionKey=${sessionKey}`,
      {
        headers: {
          'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      // If OpenClaw doesn't have this endpoint, return mock data
      if (response.status === 404) {
        return NextResponse.json({
          sessionKey,
          model: 'unknown',
          tokens: { in: 0, out: 0, total: 0 },
          status: 'active',
          note: 'Status endpoint not available on Gateway'
        });
      }
      
      const errorText = await response.text();
      console.error('OpenClaw status error:', errorText);
      throw new Error(`OpenClaw API error: ${response.status}`);
    }

    const status = await response.json();

    return NextResponse.json({
      sessionKey,
      model: status.model,
      tokens: status.usage || status.tokens || { in: 0, out: 0, total: 0 },
      status: 'active'
    });
  } catch (error: any) {
    console.error('Session status fetch failed:', error);
    return NextResponse.json(
      { 
        error: error.message,
        sessionKey: req.nextUrl.searchParams.get('sessionKey'),
        model: 'unknown',
        tokens: { in: 0, out: 0, total: 0 },
        status: 'unknown'
      },
      { status: 500 }
    );
  }
}
