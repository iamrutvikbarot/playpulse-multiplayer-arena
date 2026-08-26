import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'PlayPulse Real-Time Multiplayer Mini-Games Arena (Next.js)',
    timestamp: Date.now(),
  });
}
