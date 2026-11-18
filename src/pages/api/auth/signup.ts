import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { clientIp, countEvents, hashPassword, json, normEmail, readJson, recordEvent, sameOrigin, validEmail } from "../../../lib/auth";

const SIGNUPS_PER_IP_PER_HOUR = 5;

export const POST: APIRoute = async ({ request, url, session }) => {
  const body = await readJson(request); // read first so the body is always consumed
  if (!sameOrigin(request, url)) return json({ error: "Request blocked." }, 403);
  if (!body) return json({ error: "Invalid request." }, 400);

  const email = normEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const name = (typeof body.name === "string" ? body.name : "").trim().replace(/\s+/g, " ").slice(0, 60);

  if (!validEmail(email)) return json({ error: "Please enter a valid email address." }, 400);
  if (password.length < 8 || password.length > 128) return json({ error: "Password must be 8 to 128 characters." }, 400);
  if (password.toLowerCase() === email) return json({ error: "Password must not be the same as your email." }, 400);

  const db = env.DB;
  const ipKey = `signup:${clientIp(request)}`;
  if ((await countEvents(db, ipKey, 3600)) >= SIGNUPS_PER_IP_PER_HOUR) {
    return json({ error: "Too many sign-ups from this network. Please try again in an hour." }, 429);
  }

  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return json({ error: "An account with this email already exists. Please log in." }, 409);

  const { hash, salt, iterations } = await hashPassword(password);
  const t = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare("INSERT INTO users (email, name, password_hash, salt, iterations, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(email, name, hash, salt, iterations, t, t)
    .run();
  await recordEvent(db, ipKey);

  await session?.regenerate();
  session?.set("user", { id: Number(result.meta.last_row_id), email, name });
  return json({ ok: true });
};
