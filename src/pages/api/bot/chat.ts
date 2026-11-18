import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { json, readJson, sameOrigin, utcDay, type SessionUser } from "../../../lib/auth";

// Small, fast model on the Workers AI free allocation (10,000 Neurons a day).
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const USER_DAILY_LIMIT = 30;
const SITE_DAILY_LIMIT = 300; // keeps the whole site inside the free allocation
const MAX_TURNS = 10; // earlier messages the client may send for context
const MAX_MESSAGE_CHARS = 2000;

const SYSTEM_PROMPT = `You are GokuruviBot, the IT help assistant on Gokuruvi Tools (gokuruvi.com).
Help with Linux, Windows Server, networking, VMware, cloud (AWS, Azure, GCP), DevOps, CI/CD, Docker, Kubernetes, databases, security, scripting and IT careers (CVs, interviews).
Rules:
- Give practical, correct, step-by-step answers. Put commands and config in fenced code blocks with a language tag.
- Warn clearly before destructive commands (rm -rf, dd, mkfs, DROP, force pushes, firewall changes on remote hosts).
- If you are not sure, say so and suggest how to verify. Never invent command options.
- Never ask for or repeat passwords, private keys, tokens or other secrets; tell the user to remove them if they paste any.
- Refuse to help with attacking systems the user does not own, malware or bypassing security controls.
- If the question is not about IT, politely say you only help with IT topics.
- Keep answers focused; use short paragraphs and lists.`;

type Msg = { role: "user" | "assistant"; content: string };

async function bump(db: D1Database, userId: number, day: string, by: number) {
  const row = await db
    .prepare("INSERT INTO usage (user_id, day, count) VALUES (?1, ?2, ?3) ON CONFLICT (user_id, day) DO UPDATE SET count = count + ?3 RETURNING count")
    .bind(userId, day, by)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export const POST: APIRoute = async ({ request, url, session }) => {
  const body = await readJson(request, 40_000); // read first so the body is always consumed
  if (!sameOrigin(request, url)) return json({ error: "Request blocked." }, 403);
  const user = (await session?.get("user")) as SessionUser | undefined;
  if (!user) return json({ error: "Please log in to use GokuruviBot." }, 401);

  const raw = Array.isArray(body?.messages) ? (body.messages as unknown[]) : [];
  const messages: Msg[] = raw
    .filter((m): m is Msg => !!m && typeof m === "object" && ((m as Msg).role === "user" || (m as Msg).role === "assistant") && typeof (m as Msg).content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS * 2) }))
    .slice(-MAX_TURNS);
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) return json({ error: "Please type a question." }, 400);
  if (last.content.length > MAX_MESSAGE_CHARS) return json({ error: `Please keep a message under ${MAX_MESSAGE_CHARS} characters.` }, 400);

  const db = env.DB;
  const day = utcDay();
  const used = await bump(db, user.id, day, 1);
  if (used > USER_DAILY_LIMIT) {
    await bump(db, user.id, day, -1);
    return json({ error: `You have used today's ${USER_DAILY_LIMIT} free messages. The limit resets at 00:00 UTC.`, remaining: 0 }, 429);
  }
  const siteUsed = await bump(db, 0, day, 1);
  if (siteUsed > SITE_DAILY_LIMIT) {
    await db.batch([
      db.prepare("UPDATE usage SET count = count - 1 WHERE user_id = ? AND day = ?").bind(user.id, day),
      db.prepare("UPDATE usage SET count = count - 1 WHERE user_id = 0 AND day = ?").bind(day),
    ]);
    return json({ error: "GokuruviBot is very busy today and has reached its daily limit. Please try again tomorrow." }, 429);
  }

  try {
    const result = (await env.AI.run(MODEL as any, {
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 900,
      temperature: 0.3,
    })) as any;
    const answer: string = (result?.response ?? result?.choices?.[0]?.message?.content ?? "").toString().trim();
    if (!answer) throw new Error("empty answer");
    return json({ answer, remaining: USER_DAILY_LIMIT - used });
  } catch (err) {
    // Don't charge the user for a failed answer.
    await db.batch([
      db.prepare("UPDATE usage SET count = count - 1 WHERE user_id = ? AND day = ?").bind(user.id, day),
      db.prepare("UPDATE usage SET count = count - 1 WHERE user_id = 0 AND day = ?").bind(day),
    ]);
    const message = String((err as Error)?.message || err);
    console.error("GokuruviBot AI error:", message);
    const notLoggedIn = /auth|login|credential|account/i.test(message) && url.hostname === "localhost";
    return json(
      { error: notLoggedIn ? "Workers AI isn't connected on this local server. Run `npx wrangler login` and restart the dev server." : "GokuruviBot couldn't answer just now. Please try again in a minute." },
      503,
    );
  }
};
