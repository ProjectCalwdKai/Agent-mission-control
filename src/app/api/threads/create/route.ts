import { NextRequest, NextResponse } from 'next/server';
import { createThread } from '@/lib/session-chain';

export async function POST(req: NextRequest) {
  try {
    const { title, model } = await req.json();

    if (!title || !model) {
      return NextResponse.json({ error: 'Missing title or model' }, { status: 400 });
    }

    const { threadId, sessionKey, error } = await createThread(title, model);

    if (error) {
      console.error('Error creating thread in API:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ threadId, sessionKey }, { status: 201 });
  } catch (error: any) {
    console.error('API Error creating thread:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
