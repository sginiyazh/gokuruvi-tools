import type { APIRoute } from "astro";
export const POST: APIRoute = async ({ request }) => {
  const body = await request.arrayBuffer();
  return new Response(JSON.stringify({ ok: true, bytes: body.byteLength }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
};
