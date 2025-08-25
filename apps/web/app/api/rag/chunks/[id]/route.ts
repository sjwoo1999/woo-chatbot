export async function GET(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1];
  const upstream = process.env.SERVER_URL || 'http://localhost:3001';
  const r = await fetch(`${upstream}/rag/chunks/${id}`);
  const json = await r.json();
  return Response.json(json, { status: 200 });
}
