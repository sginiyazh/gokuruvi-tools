import type { APIRoute } from "astro";
const allowed = new Set(["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"]);
export const GET: APIRoute = async ({ url }) => {
  const name = (url.searchParams.get("name") || "").trim();
  const type = (url.searchParams.get("type") || "A").toUpperCase();
  if (!name || name.length > 253 || !allowed.has(type)) return new Response(JSON.stringify({ error: "Invalid domain or record type." }), { status: 400, headers: { "content-type": "application/json" } });
  try {
    const target = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
    const response = await fetch(target, { headers: { accept: "application/dns-json" } });
    const text = await response.text();
    return new Response(text, { status: response.ok ? 200 : 502, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch { return new Response(JSON.stringify({ error: "DNS resolver request failed." }), { status: 502, headers: { "content-type": "application/json" } }); }
};
