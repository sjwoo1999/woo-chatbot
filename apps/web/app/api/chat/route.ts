import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const upstream = process.env.SERVER_URL || 'http://localhost:3001';

  const resp = await fetch(`${upstream}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return new Response(resp.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
