import type { APIRoute } from "astro";
export const GET: APIRoute = () => new Response(JSON.stringify({ ok: true, now: Date.now() }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
