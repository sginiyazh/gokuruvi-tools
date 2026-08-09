import type { APIRoute } from "astro";
export const GET: APIRoute = ({ url }) => {
  const requested = Number(url.searchParams.get("bytes") || 4_000_000);
  const bytes = Math.min(5_000_000, Math.max(100_000, Number.isFinite(requested) ? requested : 4_000_000));
  const data = new Uint8Array(bytes);
  return new Response(data, { headers: { "content-type": "application/octet-stream", "content-length": String(bytes), "cache-control": "no-store, no-cache, must-revalidate" } });
};
