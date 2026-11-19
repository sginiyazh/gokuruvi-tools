// Linux vulnerability feed for the homepage, from Red Hat's official Security
// Data API (free, no key): https://access.redhat.com/hydra/rest/securitydata
//
// Two lists, each grouped by package (one patch usually fixes a package's batch):
//  - critical:  every CVE Red Hat rates "Critical", published in the last 30 days;
//  - important: CVEs rated "Important" with CVSS 8.0+, last 7 days.
// The result is cached in KV for an hour and refreshed in the background; the
// last good copy is kept for 7 days so a Red Hat outage doesn't empty the panel.

export interface VulnGroup {
  pkg: string; // Red Hat package / component, e.g. "nginx", "kernel"
  count: number;
  score: number | null; // highest CVSS v3 score in the group
  latest: string; // YYYY-MM-DD, newest public date
  ids: string[]; // up to 5 CVE IDs, most severe first
  title: string; // description of the most severe CVE
  patched: number; // CVEs in the group that already have an RHSA erratum
  advisory?: string; // one RHSA ID, for the link
}

export interface VulnNews {
  fetchedAt: string; // ISO time of the last successful refresh
  critical: VulnGroup[];
  criticalTotal: number; // CVEs
  important: VulnGroup[];
  importantTotal: number; // CVEs
}

interface RhCve {
  CVE: string;
  severity: string;
  public_date: string;
  advisories: string[];
  bugzilla_description: string | null;
  cvss3_score: string | null;
}

const API = "https://access.redhat.com/hydra/rest/securitydata/cve.json";
const KV_KEY = "cache:linux-vulns:v1";
const FRESH_MS = 60 * 60 * 1000;
const MIN_SCORE = 8.0;
const TOP = 6;

const day = (s: string) => s.slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const num = (s: string | null) => (s && !Number.isNaN(parseFloat(s)) ? parseFloat(s) : null);

// "nginx: NGINX use-after-free in worker process" -> package "nginx", title after the colon.
function split(desc: string | null, id: string) {
  const d = (desc || "").trim();
  const i = d.indexOf(":");
  const clean = (t: string) => {
    t = t.trim();
    // Drop repeated "component:" prefixes ("2.4/mod_http2: mod_http2: httpd: Remote code...").
    for (let n = 0; n < 4 && /^[\w./+-]+:\s/.test(t); n++) t = t.replace(/^[\w./+-]+:\s*/, "");
    // Red Hat's placeholder before its analysis is written.
    return /^from cveorg collector$/i.test(t.trim()) ? "Details pending from Red Hat" : t.trim();
  };
  if (i > 0 && i < 60) {
    const title = clean(d.slice(i + 1));
    return { pkg: d.slice(0, i).trim(), title: title || d };
  }
  return { pkg: "", title: d ? clean(d) : id };
}

async function fetchRh(params: Record<string, string>): Promise<RhCve[]> {
  const res = await fetch(`${API}?${new URLSearchParams({ per_page: "1000", ...params })}`, {
    headers: { "user-agent": "GokuruviTools/1.0 (+https://www.gokuruvi.com)", accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Red Hat API ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? (data as RhCve[]) : [];
}

// Group by package; CVEs without a package name stay on their own.
function group(list: RhCve[], order: "newest" | "score"): VulnGroup[] {
  const sorted = [...list].sort((a, b) => (num(b.cvss3_score) ?? 0) - (num(a.cvss3_score) ?? 0) || b.public_date.localeCompare(a.public_date));
  const groups = new Map<string, VulnGroup>();
  for (const v of sorted) {
    const { pkg, title } = split(v.bugzilla_description, v.CVE);
    const key = pkg ? `p:${pkg.toLowerCase()}` : `id:${v.CVE}`;
    const g = groups.get(key);
    if (g) {
      g.count++;
      if (g.ids.length < 5) g.ids.push(v.CVE);
      if (day(v.public_date) > g.latest) g.latest = day(v.public_date);
      if (v.advisories?.length) {
        g.patched++;
        g.advisory ??= v.advisories[0];
      }
    } else {
      groups.set(key, {
        pkg: pkg || v.CVE,
        count: 1,
        score: num(v.cvss3_score),
        latest: day(v.public_date),
        ids: [v.CVE],
        title,
        patched: v.advisories?.length ? 1 : 0,
        advisory: v.advisories?.[0],
      });
    }
  }
  return [...groups.values()].sort((a, b) =>
    order === "newest"
      ? b.latest.localeCompare(a.latest) || (b.score ?? 0) - (a.score ?? 0) || b.count - a.count
      : (b.score ?? 0) - (a.score ?? 0) || b.count - a.count || b.latest.localeCompare(a.latest),
  );
}

async function refresh(kv: KVNamespace | undefined): Promise<VulnNews> {
  const [critical, important] = await Promise.all([
    fetchRh({ severity: "critical", after: daysAgo(30) }),
    fetchRh({ severity: "important", after: daysAgo(7) }),
  ]);
  const importantHi = important.filter((v) => (num(v.cvss3_score) ?? 0) >= MIN_SCORE);
  const news: VulnNews = {
    fetchedAt: new Date().toISOString(),
    critical: group(critical, "newest").slice(0, TOP),
    criticalTotal: critical.length,
    important: group(importantHi, "score").slice(0, TOP),
    importantTotal: importantHi.length,
  };
  await kv?.put(KV_KEY, JSON.stringify(news), { expirationTtl: 7 * 86_400 }).catch(() => {});
  return news;
}

export async function readCached(kv: KVNamespace | undefined): Promise<VulnNews | null> {
  try {
    return (await kv?.get<VulnNews>(KV_KEY, "json")) ?? null;
  } catch {
    return null;
  }
}

export const isFresh = (n: VulnNews | null) => !!n && Date.now() - Date.parse(n.fetchedAt) < FRESH_MS;

// Fresh data, refreshing from Red Hat when the cache is over an hour old; falls
// back to the last good copy if Red Hat is unreachable.
export async function getVulnNews(env: { SESSION?: KVNamespace }): Promise<VulnNews | null> {
  const cached = await readCached(env.SESSION);
  if (isFresh(cached)) return cached;
  try {
    return await refresh(env.SESSION);
  } catch (err) {
    console.error("Red Hat feed refresh failed:", String(err));
    return cached;
  }
}
