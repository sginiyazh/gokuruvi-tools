// Shape of the written guide shown below each tool (see components/ToolGuide.astro).
// Text fields support `inline code` with backticks; everything else is plain text.

export interface ToolGuideContent {
  /** Section heading, e.g. "How to use the Hash Generator". */
  heading: string;
  /** Opening paragraphs explaining what the tool is for and when to use it. */
  intro: string[];
  /** Numbered usage steps. */
  steps: string[];
  /** Worked examples; `code` is shown as a copyable block. */
  examples?: Array<{ title: string; code?: string; text: string }>;
  /** Common mistakes, gotchas and practical tips. */
  tips?: Array<{ title: string; text: string }>;
  /** Also emitted as FAQPage structured data. */
  faq: Array<{ q: string; a: string }>;
  related?: Array<{ href: string; label: string }>;
}
