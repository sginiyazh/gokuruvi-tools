// Best-effort parser that turns the plain text of a CV into the CV builder's fields.
// Runs in the browser; nothing is sent anywhere. CV layouts vary a lot, so every
// result is a starting point the user is asked to check.

export interface ParsedJob {
  title: string;
  company: string;
  location: string;
  dates: string;
  bullets: string;
}

export interface ParsedCv {
  cvRole?: string;
  cvName: string;
  cvTitle: string;
  cvLocation: string;
  cvEmail: string;
  cvPhone: string;
  cvLinkedin: string;
  cvVisa: string;
  cvNotice: string;
  cvSummary: string;
  cvSkills: string;
  cvCerts: string;
  cvEducation: string;
  jobs: ParsedJob[];
}

type Section = "summary" | "skills" | "experience" | "projects" | "education" | "certs" | "other";

// Heading text (letters only, lower case, trailing "14 years" removed) -> section.
// "other" is checked first so "personal profile" is not mistaken for a summary.
const HEADINGS: Array<[Section, RegExp]> = [
  ["other", /^(personal (details|information|profile|data|particulars)|languages?( known)?|references?|hobbies|interests|declaration|strengths|key achievements|achievements|awards( and achievements)?|extra curricular activities)$/],
  ["summary", /^(professional |career |executive )?(summary|profile|objective|overview)$|^about( me)?$|^career objective$|^pr[eé]cis$/],
  ["skills", /^(technical |key |core |it |professional )?(skills?|competenc(y|ies)|expertise|proficienc(y|ies))( summary| section| set)?$|^skills? (and|&) (tools|technologies)$|^technologies$|^tools (and|&) technologies$/],
  ["experience", /^(professional |work |employment |career |relevant |industrial )?(experience|history)( details| summary)?$|^employment (history|details)$|^work history$|^career history$/],
  ["projects", /^(projects?|key projects|projects? handled|project details|project experience|assignments?)$/],
  ["education", /^(education|educational (background|qualifications?|details)|academic (background|qualifications?|credentials|details|profile)|qualifications?)$/],
  ["certs", /^((professional |technical )?certifications?|certificates?|licen[cs]es( (and|&) certifications?)?|certifications? (and|&) (training|licen[cs]es)|training( (and|&) certifications?)?)$/],
];

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const POINT = `(?:${MONTH}\\s*'?\\d{2,4}|\\d{1,2}[/.-]\\d{2,4}|(?:19|20)\\d{2})`;
const DATE_RANGE = new RegExp(`${POINT}\\s*(?:-|–|—|to|till)\\s*(?:${POINT}|present|current|now|till date|to date|date|ongoing)`, "i");
// Bullet marks, including symbol-font bullets that PDFs store as private-use characters.
const BULLET = /^\s*(?:[•●▪◦‣■□➢➤►\-*–·o-]|\d+[.)](?=\s))\s*/;
const PLACES = /\b(dubai|abu dhabi|sharjah|ajman|ras al khaimah|fujairah|umm al quwain|al ain|uae|united arab emirates|india|chennai|bangalore|bengaluru|mumbai|kochi|hyderabad|delhi|pune|qatar|doha|saudi|saudi arabia|riyadh|jeddah|oman|muscat|bahrain|kuwait|uk|london|usa|singapore|sri lanka|pakistan|philippines|egypt)\b/i;
const COMPANY_HINT = /\b(llc|l\.l\.c|ltd|limited|inc|corp|corporation|group|company|co\.|fze|fzco|fz-llc|wll|bank|technologies|technology|solutions|systems|services|consulting|pvt|private|plc|gmbh|airways|telecom|communications|hospital|university|government)\b/i;
// "Organization : X", "Job Profile : Y", "Duration : Z" style job details.
const JOB_LABEL = /^(?:\d+[.)]\s*)?(organi[sz]ation|company( name)?|employer|job profile|designation|position|job title|role|duration|period|dates?|tenure|location|work location)\s*[:–-]\s*(.+)$/i;
// Lines inside a job that are labels, not achievements.
const NOT_A_BULLET = /^(key (contributions|responsibilities|achievements)|responsibilities|roles? (and|&) responsibilities|duties)\s*:?$|^(client|ticketing tools?|tools? used|environment|team size|project)\s*[:–-]/i;

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const words = (s: string) => clean(s).split(" ").filter(Boolean).length;
const stripBullet = (s: string) => clean(s.replace(BULLET, ""));

/** Undo "fake bold" PDFs that draw each letter twice: "SSaatthhiisshh" -> "Sathish". */
function undouble(line: string): string {
  const tokens = line.split(/(\s+)/);
  const isDoubled = (t: string) => t.length >= 2 && t.length % 2 === 0 && [...t].every((c, i) => i % 2 === 1 || c === t[i + 1]);
  const real = tokens.filter((t) => t.trim().length >= 2);
  if (!real.length || real.filter(isDoubled).length / real.length < 0.7) return line;
  return tokens.map((t) => (isDoubled(t) ? [...t].filter((_, i) => i % 2 === 0).join("") : t)).join("");
}

function headingOf(line: string): Section | null {
  const t = line.trim().replace(/[:\-–]+$/, "").replace(/\s*\d+\+?\s*(years?|yrs?)\.?\s*$/i, "");
  if (!t || words(t) > 5 || /[@\d]/.test(t)) return null;
  const key = t.toLowerCase().replace(/[^a-zé& ]/g, "").replace(/\s+/g, " ").trim();
  for (const [section, re] of HEADINGS) if (re.test(key)) return section;
  return null;
}

/** Splits CV text into lines, undoing doubled letters and joining PDF line-wraps. */
export function toLines(text: string): string[] {
  const raw = text.replace(/\r/g, "").split("\n").map((l) => undouble(l.replace(/\t/g, " ").replace(/\s+$/, "")));
  const out: string[] = [];
  for (const line of raw) {
    const t = line.trim();
    if (!t) { out.push(""); continue; }
    const prev = out[out.length - 1];
    const isLinkOrEmail = /@|^(https?:|www\.)|^[a-z0-9-]+\.[a-z]{2,}\//i.test(t);
    const continuesSentence = prev && /^[a-z(]/.test(t) && !BULLET.test(t) && !isLinkOrEmail && !/[.:]$/.test(prev);
    // A short line under an unfinished bullet ("…in Active" / "Directory.") is the end of that bullet.
    const endsBullet = prev && BULLET.test(prev) && !/[.:;!?]$/.test(prev) && !BULLET.test(t) && words(t) <= 6 && !/\d/.test(t) && !headingOf(t) && !JOB_LABEL.test(t);
    if (continuesSentence || endsBullet) out[out.length - 1] = prev + " " + t;
    else out.push(t);
  }
  return out;
}

function splitPlace(value: string): { name: string; location: string } {
  const parts = value.split(/\s*,\s*/).map(clean).filter(Boolean);
  const placeAt = parts.findIndex((p, i) => i > 0 && PLACES.test(p));
  if (placeAt < 0) return { name: clean(value), location: "" };
  return { name: parts.slice(0, placeAt).join(", "), location: parts.slice(placeAt).join(", ") };
}

function splitTitleCompany(parts: string[]): { title: string; company: string; location: string } {
  let title = "", company = "";
  const pieces: string[] = [];
  for (const p of parts) {
    const at = p.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
    if (at) { pieces.push(at[1], at[2]); continue; }
    p.split(/\s*[|•·]\s*|\s+[-–—]\s+|,\s+(?=[A-Z])/).forEach((x) => { if (clean(x)) pieces.push(clean(x)); });
  }
  const rest: string[] = [];
  const places: string[] = [];
  for (const p of pieces) {
    if (PLACES.test(p) && words(p) <= 4 && !COMPANY_HINT.test(p)) places.push(p);
    else rest.push(p);
  }
  const companyIdx = rest.findIndex((p) => COMPANY_HINT.test(p));
  if (companyIdx >= 0) { company = rest[companyIdx]; rest.splice(companyIdx, 1); }
  title = rest.shift() || "";
  if (!company) company = rest.shift() || "";
  return { title, company: company.replace(/\s+(from|since)$/i, ""), location: places.join(", ") };
}

type Entry = { text: string; bullet: boolean };
const bulletsOf = (body: Entry[]) => body
  .filter((b) => !NOT_A_BULLET.test(b.text) && !/\bclient\s*[–:-]/i.test(b.text) && (b.bullet || words(b.text) >= 6))
  .map((b) => b.text).join("\n");

/** Jobs written as a title or company line with a date range. */
function parseDatedJobs(lines: string[]): ParsedJob[] {
  type Raw = { header: string[]; dates: string; body: Entry[] };
  const jobs: Raw[] = [];
  let current: Raw | null = null;
  const loose: Entry[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const m = line.match(DATE_RANGE);
    if (m) {
      // Short, non-bullet lines just above the dates belong to this job's header.
      const source = current ? current.body : loose;
      const header: string[] = [];
      while (source.length && !source[source.length - 1].bullet && words(source[source.length - 1].text) <= 10 && header.length < 2) header.unshift(source.pop()!.text);
      const rest = clean(line.replace(m[0], " ").replace(/[()]/g, " ").replace(/\b(from|since|during)\s*$/i, "").replace(/^[\s|,–—-]+|[\s|,.–—-]+$/g, ""));
      if (rest) header.push(rest);
      current = { header, dates: clean(m[0]).replace(/\.$/, ""), body: [] };
      jobs.push(current);
      continue;
    }
    const entry = { text: stripBullet(line), bullet: BULLET.test(line) };
    if (entry.text) (current ? current.body : loose).push(entry);
  }
  if (!jobs.length && loose.length) return [{ title: "", company: "", location: "", dates: "", bullets: bulletsOf(loose) }];
  return jobs.map((j) => {
    const { title, company, location: headerLocation } = splitTitleCompany(j.header);
    let location = headerLocation;
    // A short place-only line right under the job header ("Dubai, UAE") is its location, not a bullet.
    const first = j.body[0];
    if (!location && first && !first.bullet && PLACES.test(first.text) && words(first.text) <= 4 && !/\d/.test(first.text)) {
      location = first.text;
      j.body.shift();
    }
    return { title, company, location, dates: j.dates, bullets: bulletsOf(j.body) };
  });
}

/** Jobs written as labelled fields: "Organization : …", "Job Profile : …", "Duration : …". */
function parseLabelledJobs(lines: string[]): ParsedJob[] {
  const jobs: Array<ParsedJob & { body: Entry[] }> = [];
  const blank = () => ({ title: "", company: "", location: "", dates: "", bullets: "", body: [] as Entry[] });
  let current: (ParsedJob & { body: Entry[] }) | null = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const m = line.match(JOB_LABEL);
    if (m) {
      const label = m[1].toLowerCase();
      const value = clean(m[3]).replace(/[.,;]+$/, "");
      const field = /organi|company|employer/.test(label) ? "company" : /duration|period|date|tenure/.test(label) ? "dates" : /location/.test(label) ? "location" : "title";
      // A field that is already filled means the next job has started.
      if (!current || current[field]) { current = blank(); jobs.push(current); }
      if (field === "company") {
        const { name, location } = splitPlace(value);
        current.company = name;
        if (location && !current.location) current.location = location;
      } else current[field] = value;
      continue;
    }
    if (current) current.body.push({ text: stripBullet(line), bullet: BULLET.test(line) });
  }
  return jobs.map(({ body, ...job }) => ({ ...job, bullets: bulletsOf(body) }));
}

const GENERIC = /^(llc|ltd|pvt|private|limited|from|the|and|company|group|systems|services|solutions|technologies|technology|info|it|of|for|inc|wll|plc|fze|fzco)$/i;
const keyWords = (s: string) => clean(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !GENERIC.test(w));
const startYear = (dates: string) => (dates.match(/(?:19|20)\d{2}/) || [""])[0];

/** Adds bullets from a "Projects handled" section to the job they belong to. */
function mergeProjects(jobs: ParsedJob[], projects: ParsedJob[]): ParsedJob[] {
  if (!jobs.length) return projects.filter((p) => p.bullets);
  for (const p of projects) {
    if (!p.bullets) continue;
    const words_ = keyWords([p.company, p.title].join(" "));
    const match = jobs.find((j) => keyWords(j.company).some((w) => words_.includes(w)))
      || jobs.find((j) => startYear(j.dates) && startYear(j.dates) === startYear(p.dates));
    if (match) match.bullets = [match.bullets, p.bullets].filter(Boolean).join("\n");
  }
  return jobs;
}

function guessRole(text: string): string {
  const t = text.toLowerCase();
  const rules: Array<[string, RegExp]> = [
    ["kubernetes", /kubernetes|platform engineer|\bsre\b/],
    ["devops", /devops|ci\/cd|jenkins/],
    ["cloud", /cloud engineer|cloud architect|\baws\b|\bazure\b|\bgcp\b/],
    ["security", /security|\bsoc\b|siem|cyber/],
    ["network", /network engineer|network administrator|\bccna\b|\bccnp\b|routing/],
    ["vmware", /vmware|vsphere|virtuali[sz]ation/],
    ["database", /database|\bdba\b|oracle|sql server|postgresql/],
    ["windows", /windows server|windows administrator|active directory|\bmcsa\b/],
    ["support", /help ?desk|service desk|it support|desktop support|customer support/],
    ["linux", /linux|unix|rhel|red hat|ubuntu|system administrator/],
  ];
  for (const [role, re] of rules) if (re.test(t)) return role;
  return "";
}

export function parseCv(text: string): ParsedCv {
  const lines = toLines(text);
  const all = lines.join("\n");

  // Contact details can be anywhere, often in a header or footer.
  const email = (all.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [""])[0];
  const linkedin = (all.match(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?/i) || all.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i) || [""])[0];
  let phone = "";
  for (const m of all.matchAll(/(?:\+|00)?\d[\d\s().-]{7,}\d/g)) {
    const digits = m[0].replace(/\D/g, "");
    if (digits.length >= 9 && digits.length <= 15 && !DATE_RANGE.test(m[0])) { phone = clean(m[0]); break; }
  }
  const visa = clean((all.match(/visa(?:\s*status)?\s*[:\-–]\s*([^\n|•]+)/i) || ["", ""])[1]);
  const notice = clean((all.match(/notice(?:\s*period)?\s*[:\-–]\s*([^\n|•]+)/i) || ["", ""])[1]);

  // Split into the header (before the first heading) and named sections.
  const sections: Record<Section, string[]> = { summary: [], skills: [], experience: [], projects: [], education: [], certs: [], other: [] };
  const header: string[] = [];
  let section: Section | null = null;
  for (const line of lines) {
    // "Skills: Linux, Ansible" on one line counts as a heading plus content.
    const inline = line.match(/^([A-Za-z &]{3,40}):\s*(.+)$/);
    const h = headingOf(line) || (inline ? headingOf(inline[1]) : null);
    if (h) { section = h; if (inline && headingOf(inline[1])) sections[h].push(inline[2]); continue; }
    if (section) sections[section].push(line);
    else header.push(line);
  }

  // Jobs: labelled fields, or titles with date ranges; project details are merged in.
  const labelled = sections.experience.filter((l) => JOB_LABEL.test(l)).length >= 2;
  let jobs = labelled ? parseLabelledJobs(sections.experience) : parseDatedJobs(sections.experience);
  jobs = jobs.filter((j) => j.title || j.company || j.bullets);
  if (sections.projects.length) jobs = mergeProjects(jobs, parseDatedJobs(sections.projects));

  // Name and title come from the first short lines without contact details.
  const isContact = (l: string) => /@|https?:|www\.|linkedin|\d{3}/i.test(l) || (PLACES.test(l) && /[,|]/.test(l));
  const plain = header.map(clean).filter((l) => l && !isContact(l) && !/visa|notice/i.test(l));
  const labelledName = clean((all.match(/^\s*(?:full\s*)?name\s*[:–-]\s*([A-Za-z .'-]{3,60})$/im) || ["", ""])[1]);
  const rawName = plain.find((l) => /^[A-Za-z][A-Za-z .'-]+$/.test(l) && words(l) >= 2 && words(l) <= 5) || labelledName;
  // "PRIYA NAIR" -> "Priya Nair"; mixed-case names are left as written.
  const name = rawName === rawName.toUpperCase() ? rawName.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : rawName;
  const current = jobs[0];
  const title = plain.find((l) => l !== rawName && words(l) <= 10 && !PLACES.test(l) && !/[.!?]$/.test(l)) || current?.title || "";

  let location = "";
  for (const l of header) {
    for (const part of l.split(/\s*[|•·]\s*/)) {
      const candidate = clean(part.replace(/^(address|location|based in)\s*:?\s*/i, ""));
      if (PLACES.test(candidate) && !/@|\d{4}/.test(candidate) && words(candidate) <= 6) { location = candidate; break; }
    }
    if (location) break;
  }
  // No location in the header: use the current job's, if it is still ongoing.
  if (!location && current && /present|current|now|till|to date|ongoing/i.test(current.dates)) location = current.location;

  const summaryLines = sections.summary.length ? sections.summary : header.filter((l) => words(l) >= 12);
  // Skills come from "Label: a, b, c" lines, comma lists and short items. Full sentences
  // describing duties ("Administered and maintained Linux servers…") are skipped.
  const skillItems = (line: string): string[] => {
    const text = stripBullet(line);
    if (!text || /:\s*$/.test(text) || NOT_A_BULLET.test(text)) return [];
    const labelled = text.match(/^[A-Za-z /&()-]{2,40}:\s*(.+)$/);
    const body = labelled ? labelled[1] : text;
    const parts = body.split(/\s*[,|•;·]\s*|\s{2,}/).map((s) => clean(s).replace(/[.]+$/, "")).filter(Boolean);
    if (labelled) return parts;
    const sentence = /\.$/.test(text) || /^[a-z]/.test(text) || /^[A-Za-z]+ed\b/.test(text) || /,\s*and\s/i.test(text);
    if (sentence) return [];
    if (words(text) <= 4) return parts;
    const listLike = parts.length >= 3 && parts.every((p) => words(p) <= 4);
    return listLike ? parts : [];
  };
  const skills = Array.from(new Set(
    sections.skills.flatMap(skillItems).filter((s) => words(s) <= 5 && !/responsibilit|contribution|achievement/i.test(s)),
  )).slice(0, 40);
  const listLines = (ls: string[]) => ls.map(stripBullet).filter(Boolean).join("\n");

  const parsed: ParsedCv = {
    cvName: name,
    cvTitle: title,
    cvLocation: location,
    cvEmail: email,
    cvPhone: phone,
    cvLinkedin: linkedin,
    cvVisa: visa,
    cvNotice: notice,
    cvSummary: clean(summaryLines.map(stripBullet).join(" ")),
    cvSkills: skills.join(", "),
    cvCerts: listLines(sections.certs),
    cvEducation: listLines(sections.education),
    jobs,
  };
  // The person's own title is the best signal; skills only decide when the title doesn't.
  const role = guessRole([title, jobs[0]?.title || ""].join(" ")) || guessRole(parsed.cvSkills);
  if (role) parsed.cvRole = role;
  return parsed;
}
