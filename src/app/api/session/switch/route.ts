/**
 * API Route: Switch Agent Model (Session Chaining)
 * 
 * POST /api/session/switch
 * Body: { threadId, newModel, reason? }
 * Returns: { success, newSessionKey, oldSessionKey, threadId, error? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { switchAgentModel } from '@/lib/session-chain';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId, newModel, reason = 'model_switch' } = body;

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 }
      );
    }

    if (!newModel) {
      return NextResponse.json(
        { error: 'newModel is required' },
        { status: 400 }
      );
    }

    // Execute the switch
    const result = await switchAgentModel(threadId, newModel, reason);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    console.error('Session switch API failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
