import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const upstream = process.env.SERVER_URL || 'http://localhost:3001';
  const r = await fetch(`${upstream}/rag/chunks/${params.id}`);
  const json = await r.json();
  return Response.json(json, { status: 200 });
}
