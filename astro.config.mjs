import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Sitemap <lastmod> comes from the last git commit touching a page's source file
// (and, for tool pages, the guide text in src/data/toolGuides). Skipped on shallow
// clones, where every file would report the same commit date.
const git = (...args) => {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};
const useGitDates = git("rev-parse", "--is-shallow-repository") === "false";

function lastCommitDate(file) {
  const iso = git("log", "-1", "--format=%cI", "--", file);
  return iso ? new Date(iso) : undefined;
}

function pageLastmod(url) {
  const path = new URL(url).pathname.replace(/\/$/, "");
  const source = [`src/pages${path}.astro`, `src/pages${path}/index.astro`].find(existsSync);
  if (!source) return undefined;
  const files = [source];
  const guideGroup = readFileSync(source, "utf8").match(/import \{ (\w+)Guides \} from "[./]*\/data\/toolGuides"/);
  if (guideGroup) files.push(`src/data/toolGuides/${guideGroup[1]}.ts`);
  const dates = files.map(lastCommitDate).filter(Boolean);
  return dates.length ? new Date(Math.max(...dates)) : undefined;
}

export default defineConfig({
  site: "https://www.gokuruvi.com",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/guides/rhel-reset-root-password/"),
      serialize(item) {
        if (useGitDates) {
          const lastmod = pageLastmod(item.url);
          if (lastmod) item.lastmod = lastmod.toISOString();
        }
        return item;
      },
    }),
  ],
});
