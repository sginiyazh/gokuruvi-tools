import type { APIRoute } from "astro";
import { json, sameOrigin } from "../../../lib/auth";

export const POST: APIRoute = async ({ request, url, session }) => {
  await request.arrayBuffer().catch(() => null); // always consume the body
  if (!sameOrigin(request, url)) return json({ error: "Request blocked." }, 403);
  session?.destroy();
  return json({ ok: true });
};
