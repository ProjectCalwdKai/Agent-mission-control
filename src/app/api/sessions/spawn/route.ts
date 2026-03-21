/**
 * API Route: Spawn New OpenClaw Session
 * 
 * POST /api/sessions/spawn
 * Body: { model, task, initialContext?, mode?, runtime? }
 */

import { NextRequest, NextResponse } from 'next/server';

const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:8080';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || process.env.OPENCLAW_GATEWAY_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      model,
      task,
      initialContext,
      mode = 'session',
      runtime = 'subagent'
    } = body;

    if (!model) {
      return NextResponse.json(
        { error: 'model is required' },
        { status: 400 }
      );
    }

    const message = initialContext || task || 'New session';

    // Call OpenClaw Gateway sessions_spawn
    const response = await fetch(`${OPENCLAW_URL}/api/sessions/spawn`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task: message,
        model,
        mode,
        runtime,
        cleanup: 'keep'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenClaw spawn error:', errorText);
      throw new Error(`OpenClaw API error: ${response.status}`);
    }

    const session = await response.json();

    return NextResponse.json({
      sessionKey: session.sessionKey || session.id,
      model,
      mode,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Session spawn failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
