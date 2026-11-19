import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getVulnNews } from "../../lib/vulnNews";

export const GET: APIRoute = async () => {
  const news = await getVulnNews(env);
  if (!news) {
    return new Response(JSON.stringify({ error: "Vulnerability feed is unavailable right now." }), {
      status: 503,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
  return new Response(JSON.stringify(news), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
  });
};
