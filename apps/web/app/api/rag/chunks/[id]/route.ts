export async function GET(_: Request, context: any) {
  const id = context?.params?.id as string;
  const upstream = process.env.SERVER_URL || 'http://localhost:3001';
  const r = await fetch(`${upstream}/rag/chunks/${id}`);
  const json = await r.json();
  return Response.json(json, { status: 200 });
}
