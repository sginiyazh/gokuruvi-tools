// Shared helpers for GokuruviBot accounts: password hashing, request checks,
// rate limiting and JSON responses. Runs on Cloudflare Workers (WebCrypto + D1).

export interface SessionUser {
  id: number;
  email: string;
  name: string;
}

// Workers caps PBKDF2 at 100,000 iterations.
const ITERATIONS = 100_000;
const enc = new TextEncoder();

const toB64 = (bytes: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, 256);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, ITERATIONS);
  return { hash: toB64(hash), salt: toB64(salt), iterations: ITERATIONS };
}

export async function verifyPassword(password: string, hashB64: string, saltB64: string, iterations: number) {
  const actual = new Uint8Array(await pbkdf2(password, fromB64(saltB64), iterations));
  const expected = fromB64(hashB64);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

// Used when the email is unknown, so a failed login takes the same time either way.
export async function fakeVerify(password: string) {
  await pbkdf2(password, new Uint8Array(16), ITERATIONS);
}

export function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });
}

// Reject cross-site POSTs: the browser always sends Origin on fetch() POSTs.
export function sameOrigin(request: Request, url: URL) {
  return request.headers.get("origin") === url.origin;
}

export function clientIp(request: Request) {
  return request.headers.get("cf-connecting-ip") || "local";
}

export async function readJson(request: Request, maxBytes = 32_000): Promise<Record<string, unknown> | null> {
  const text = await request.text().catch(() => "");
  if (!(request.headers.get("content-type") || "").includes("application/json")) return null;
  if (text.length > maxBytes) return null;
  try {
    const data = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export const normEmail = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");
export const validEmail = (e: string) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

const now = () => Math.floor(Date.now() / 1000);

// How many events were recorded for this key in the last `windowSec` seconds.
export async function countEvents(db: D1Database, key: string, windowSec: number) {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM auth_events WHERE key = ? AND at > ?")
    .bind(key, now() - windowSec)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function recordEvent(db: D1Database, ...keys: string[]) {
  const t = now();
  await db.batch([
    ...keys.map((k) => db.prepare("INSERT INTO auth_events (key, at) VALUES (?, ?)").bind(k, t)),
    // Housekeeping: nothing older than a day is ever checked.
    db.prepare("DELETE FROM auth_events WHERE at < ?").bind(t - 86_400),
  ]);
}

export async function clearEvents(db: D1Database, key: string) {
  await db.prepare("DELETE FROM auth_events WHERE key = ?").bind(key).run();
}

export const utcDay = () => new Date().toISOString().slice(0, 10);
