import type { APIRoute } from "astro";
export const POST: APIRoute = async ({ request }) => {
  try {
    const { ip, key } = await request.json() as { ip?: string; key?: string };
    if (!ip?.trim() || !key?.trim()) return new Response(JSON.stringify({ error: "IP address and API key are required." }), { status: 400, headers: { "content-type": "application/json" } });
    const target = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip.trim())}&maxAgeInDays=90&verbose=true`;
    const response = await fetch(target, { headers: { Key: key.trim(), Accept: "application/json" } });
    const data = await response.text();
    return new Response(data, { status: response.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch { return new Response(JSON.stringify({ error: "Unable to complete the AbuseIPDB lookup." }), { status: 500, headers: { "content-type": "application/json" } }); }
};
