import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { clearEvents, clientIp, countEvents, fakeVerify, json, normEmail, readJson, recordEvent, sameOrigin, verifyPassword } from "../../../lib/auth";

const MAX_FAILS_PER_EMAIL = 5; // per 15 minutes
const MAX_FAILS_PER_IP = 20; // per 15 minutes
const WINDOW = 15 * 60;

export const POST: APIRoute = async ({ request, url, session }) => {
  const body = await readJson(request); // read first so the body is always consumed
  if (!sameOrigin(request, url)) return json({ error: "Request blocked." }, 403);
  if (!body) return json({ error: "Invalid request." }, 400);

  const email = normEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password || password.length > 128) return json({ error: "Email or password is incorrect." }, 401);

  const db = env.DB;
  const emailKey = `login:${email}`;
  const ipKey = `loginip:${clientIp(request)}`;
  if ((await countEvents(db, emailKey, WINDOW)) >= MAX_FAILS_PER_EMAIL || (await countEvents(db, ipKey, WINDOW)) >= MAX_FAILS_PER_IP) {
    return json({ error: "Too many failed attempts. Please wait 15 minutes and try again." }, 429);
  }

  const user = await db
    .prepare("SELECT id, email, name, password_hash, salt, iterations FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: number; email: string; name: string; password_hash: string; salt: string; iterations: number }>();

  let ok = false;
  if (user) ok = await verifyPassword(password, user.password_hash, user.salt, user.iterations);
  else await fakeVerify(password);

  if (!user || !ok) {
    await recordEvent(db, emailKey, ipKey);
    return json({ error: "Email or password is incorrect." }, 401);
  }

  await clearEvents(db, emailKey);
  await db.prepare("UPDATE users SET last_login = ? WHERE id = ?").bind(Math.floor(Date.now() / 1000), user.id).run();
  await session?.regenerate();
  session?.set("user", { id: user.id, email: user.email, name: user.name });
  return json({ ok: true });
};
