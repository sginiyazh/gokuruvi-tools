import type { ToolGuideContent } from "./types";

export const careerGuides: Record<string, ToolGuideContent> = {
  "cv-builder": {
    heading: "How to write a CV that gets past ATS filters and recruiters",
    intro: [
      "Most medium and large employers, and nearly every recruitment agency, run applications through an applicant tracking system (ATS) before a person reads them. The ATS reads the text of your CV and lets recruiters search it for skills, job titles and certifications. A CV that is hard for the software to read, or that never mentions the tools in the job advert, can be skipped even when you are a good fit.",
      "This tool builds a plain, single-column CV that ATS software reads reliably, and checks it the way a recruiter would: are the contact details complete, do the bullets show results with numbers, and does the CV mention the skills the target role usually asks for? The checks are simple rules, not AI, so the advice is predictable and nothing you type leaves your browser.",
    ],
    steps: [
      "If you already have a CV, upload it as a PDF, Word (.docx) or text file, or paste its text. The form fills itself in; check every field, because CV layouts vary.",
      "Choose the role you are applying for. If you have the job advert, paste it in so the tool can list skills it asks for that your CV doesn't mention.",
      "Fill in your contact details. In the UAE, recruiters often expect your location, visa status and notice period near the top, so add them if they help your application.",
      "Write a 3–4 sentence summary: years of experience, the platforms you know best, and the kind of result you deliver.",
      "List your technical skills, separated by commas. Use the exact names employers search for, such as `RHEL` or `Kubernetes`, not only general phrases.",
      "Add each job with dates and 3–6 achievement bullets. Start each bullet with an action verb and include a number wherever you honestly can.",
      "Work through the ATS check until most items show a tick, then click Save as PDF and choose Save as PDF as the printer.",
    ],
    examples: [
      {
        title: "Turning a duty into an achievement",
        code: "Weak:   Responsible for patching Linux servers\nBetter: Patched 120 RHEL servers monthly with Ansible\nBest:   Automated monthly patching for 120 RHEL servers with Ansible,\n        cutting the maintenance window from 6 hours to 2",
        text: "Recruiters skim. A bullet that says what you did, how much, and what improved is read; a list of duties is skipped. Use real numbers from your work: server counts, users supported, uptime, tickets closed, hours or money saved.",
      },
      {
        title: "Matching the job advert without keyword stuffing",
        text: "If an advert asks for Terraform and Prometheus and you have used them, name them in your skills and in a bullet that shows how you used them. If you haven't used them, don't add them: a recruiter or interviewer will ask about every tool on your CV, and claiming skills you don't have ends interviews quickly.",
      },
    ],
    tips: [
      { title: "Keep the layout simple", text: "Tables, text boxes, columns, icons and skill bars can confuse ATS software and scramble the order of your text. One column, standard headings and a common font are the safest choice." },
      { title: "One CV per role type", text: "A Linux administrator CV and a cloud engineer CV should lead with different skills and achievements. Keep a version for each type of role you apply for instead of one generic CV." },
      { title: "Certifications carry weight in IT", text: "List the full certification name and the year, for example `Red Hat Certified System Administrator (RHCSA), 2023`. Recruiters often search for the abbreviation, so include both." },
      { title: "Photo and personal details", text: "Some UAE employers still expect a photo, nationality or date of birth, while international companies often prefer you leave them out. This tool leaves them out, which is the safer default for ATS. Add them only if the employer asks." },
      { title: "Two pages is enough", text: "For most roles, one page is fine with under five years of experience and two pages with more. Cut older or unrelated jobs to a single line instead of removing them completely." },
    ],
    faq: [
      { q: "Is my CV uploaded or stored on a server?", a: "No. Everything runs in your browser. Your draft is saved only in this browser's local storage so you can return to it, and Clear all deletes it." },
      { q: "Can I upload my existing CV?", a: "Yes. Upload a PDF, Word (.docx) or .txt file, or paste the text, and the tool fills in the form. The file is read inside your browser and is never uploaded to a server. Scanned or image-only PDFs have no readable text, and old .doc files need to be saved as .docx first. Always check the imported fields, because every CV is laid out differently." },
      { q: "Does the ATS score guarantee I will get an interview?", a: "No. Every employer's system and recruiter is different. The score shows how well your CV follows common good practice and how many typical role keywords it mentions, which improves your chances but can't guarantee a result." },
      { q: "Is this an AI CV writer?", a: "No. The checks are fixed rules written for CVs, so they don't invent experience or change your words. You can use an AI assistant to help rephrase a bullet, but always check that the result is accurate." },
      { q: "How do I save the CV as a PDF?", a: "Click Save as PDF. Your browser's print window opens; choose Save as PDF (or Microsoft Print to PDF) as the printer. Only the CV is printed, not the rest of the page." },
      { q: "Should I include my visa status in a UAE CV?", a: "If you are already in the UAE with a valid or transferable visa, it can help, because employers can see you can start without sponsorship delays. If you are applying from abroad, you can leave it out." },
    ],
    related: [
      { href: "/interview-qa/", label: "IT Scenario Interview Q&A" },
      { href: "/ai/prompt-library/", label: "AI Prompt Library" },
      { href: "/guides/", label: "Technical Guides" },
      { href: "/linux/", label: "Linux Tools" },
    ],
  },
};
