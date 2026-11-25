// Minimal, safe Markdown for GokuruviBot answers. All text is HTML-escaped first,
// so nothing the model writes can inject tags; then a small subset is formatted:
// fenced code blocks, inline code, bold, headings, lists and tables.

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function inline(text: string) {
  // text is already escaped. Swap inline code out first so bold can wrap it
  // ("**Check with `df`**") without touching the code's own characters.
  const codes: string[] = [];
  const marked = text.replace(/`([^`\n]+)`/g, (_, c: string) => `\u0000${codes.push(c) - 1}\u0000`);
  return marked
    .replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\u0000(\d+)\u0000/g, (_, i: string) => `<code>${codes[+i]}</code>`);
}

function blocks(text: string) {
  const out: string[] = [];
  let list: { type: "ul" | "ol"; items: string[]; start: number } | null = null;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join("<br>"))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.type}${list.type === "ol" && list.start > 1 ? ` start="${list.start}"` : ""}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.type}>`);
    list = null;
  };
  const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map((c) => inline(c.trim()));
  const tr = (row: string, tag: "th" | "td") => `<tr>${cells(row).map((c) => `<${tag}>${c}</${tag}>`).join("")}</tr>`;
  const lines = text.split("\n").map((l) => l.replace(/^\s*&gt;\s?/, "")); // show quotes as plain text
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    const t = line.trim();
    // Table: a "| a | b |" row followed by a "|---|---|" row.
    if (t.startsWith("|") && /^\|[\s:|-]*-[\s:|-]*$/.test((lines[n + 1] || "").trim())) {
      flushPara();
      flushList();
      let body = "";
      for (n += 2; n < lines.length && lines[n].trim().startsWith("|"); n++) body += tr(lines[n], "td");
      n--;
      out.push(`<div class="tbl"><table><thead>${tr(t, "th")}</thead><tbody>${body}</tbody></table></div>`);
      continue;
    }
    const heading = t.match(/^#{1,6}\s+(.*)$/);
    const bullet = t.match(/^[-*•]\s+(.*)$/);
    const num = t.match(/^(\d+)[.)]\s+(.*)$/);
    if (!t) {
      flushPara();
      flushList();
    } else if (heading) {
      flushPara();
      flushList();
      out.push(`<h4>${inline(heading[1])}</h4>`);
    } else if (bullet || num) {
      flushPara();
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [], start: num ? Math.min(+num[1], 999) : 1 };
      }
      list.items.push(bullet ? bullet[1] : num![2]);
    } else if (list && /^\s{2,}/.test(line)) {
      list.items[list.items.length - 1] += " " + t; // continuation of a list item
    } else {
      flushList();
      para.push(t);
    }
  }
  flushPara();
  flushList();
  return out.join("");
}

export function renderMarkdown(src: string) {
  const escaped = escapeHtml(src.replace(/\r\n/g, "\n"));
  // Split on fenced code blocks; an unclosed fence runs to the end.
  const re = /```([\w+#.-]*)[^\n]*\n([\s\S]*?)(?:```|$)/g;
  let html = "";
  let last = 0;
  for (let m; (m = re.exec(escaped)); ) {
    html += blocks(escaped.slice(last, m.index));
    const lang = m[1] ? ` data-lang="${m[1]}"` : "";
    html += `<pre${lang}><code>${m[2].replace(/\n$/, "")}</code></pre>`;
    last = re.lastIndex;
    if (m[0].length === 0) re.lastIndex++;
  }
  html += blocks(escaped.slice(last));
  return html;
}
