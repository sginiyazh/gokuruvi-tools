import type { ToolGuideContent } from "./types";

export const aiGuides: Record<string, ToolGuideContent> = {
  "token-counter": {
    heading: "How to estimate LLM tokens and API cost",
    intro: [
      "Large language model APIs charge per token, not per word or request. A token is a chunk of text, often part of a word. In English, one token averages about 4 characters, or roughly three-quarters of a word. Input tokens (your prompt, system instructions and any documents) and output tokens (the model's answer) are priced separately, and output is usually several times more expensive.",
      "This tool estimates the token count of your text by averaging two common rules of thumb (characters ÷ 4 and words × 1.33). It then multiplies by reference prices per million tokens to estimate input cost and total cost including the expected output. Everything runs in your browser, and your prompt is never sent to any AI provider.",
    ],
    steps: [
      "Paste your prompt, document or code into the text box.",
      "Choose the model family you plan to use.",
      "Enter how many output tokens you expect. A short answer is 200–500, a detailed report 1,000–4,000.",
      "Read the estimated tokens and costs, then multiply by your expected number of requests per day or month.",
    ],
    examples: [
      {
        title: "Estimating a monthly budget",
        text: "A support assistant sends a 1,500-token prompt (instructions plus retrieved articles) and gets a 400-token reply, 2,000 times a day. That's 3 million input and 0.8 million output tokens per day, about 90 million and 24 million per month. Multiply each by the provider's current per-million price, and add 20–30% headroom for retries and longer conversations.",
      },
      {
        title: "Counting exactly",
        code: "# OpenAI models (Python)\nimport tiktoken\nenc = tiktoken.get_encoding(\"o200k_base\")\nprint(len(enc.encode(open(\"prompt.txt\").read())))\n\n# Anthropic models: the Messages API has a count_tokens endpoint\n# Gemini: the API exposes countTokens",
        text: "Each provider uses its own tokenizer, so exact counts differ between models. Use the provider's counter before committing to a budget.",
      },
    ],
    tips: [
      { title: "Always check current pricing", text: "Prices change often and vary by model tier, region, batch processing and caching. Treat this tool's prices as planning references and confirm them on the provider's pricing page." },
      { title: "Conversation history adds up", text: "In a chat, every earlier message is usually sent again with each new turn, so input tokens grow as the conversation continues." },
      { title: "Use prompt caching", text: "Many providers discount repeated prompt prefixes, such as long system prompts or reference documents. Put the stable content first to benefit." },
      { title: "Code and non-English text use more tokens", text: "Source code, JSON, and languages like Tamil, Arabic or Chinese typically need more tokens per character than English prose." },
    ],
    faq: [
      { q: "How accurate is this estimate?", a: "Usually within about 10–20% for ordinary English text. Code, tables and non-English text can differ more. Use the provider's own token counter when you need exact numbers." },
      { q: "Is my prompt sent to OpenAI, Anthropic or Google?", a: "No. The count is calculated in your browser and nothing is sent anywhere." },
      { q: "Why are output tokens more expensive?", a: "Generating tokens one at a time needs more computation than reading the input in parallel, so providers charge more for output." },
      { q: "How many words is 1,000 tokens?", a: "About 750 English words, or roughly one and a half pages of single-spaced text." },
    ],
    related: [
      { href: "/ai/context-window-calculator/", label: "Context Window Calculator" },
      { href: "/ai/model-comparison/", label: "AI Model Comparison" },
      { href: "/ai/prompt-library/", label: "Prompt Library" },
      { href: "/ai/glossary/", label: "AI Glossary" },
    ],
  },

  "context-window-calculator": {
    heading: "How to plan your use of a model's context window",
    intro: [
      "A model's context window is the maximum number of tokens it can consider in one request. That total includes everything: the system prompt, tool definitions, conversation history, retrieved documents, your question and the model's answer. If the total goes over the limit, the request fails or older content has to be dropped.",
      "This calculator estimates how many tokens your text uses and shows the percentage of the selected window it fills (128K, 200K, 400K, 1M or 2M tokens) and how many tokens remain. If you already know the exact count, from an API response for example, type it into the manual token count box instead.",
    ],
    steps: [
      "Paste the text you plan to send (documents, code, logs), or enter a manual token count.",
      "Choose the context window size of the model you're using. Check its documentation for the exact limit.",
      "Read the tokens used, the percentage used and the tokens remaining.",
      "Make sure what remains covers the system prompt, tool schemas and the full expected answer.",
    ],
    examples: [
      {
        title: "Will this codebase fit?",
        code: "# Rough size of a repository's source files in characters (Linux/macOS)\nfind src -name '*.ts' -o -name '*.py' | xargs cat | wc -c\n# 1,200,000 characters ≈ 300,000 tokens",
        text: "300K tokens fits in a 1M window with plenty of room, but not in a 200K window. For smaller windows, send only the relevant files, or summarize first.",
      },
      {
        title: "Budgeting a long document review",
        text: "A 150-page contract is roughly 75,000 words, or about 100,000 tokens. In a 200K window, that leaves about 100K for instructions and a detailed answer. In a 128K window, it would be tight once you add a system prompt and room for the reply.",
      },
    ],
    tips: [
      { title: "Bigger isn't always better", text: "Models can pay less attention to details buried in the middle of very long inputs, and long prompts cost more and respond more slowly. Send what's relevant, not everything." },
      { title: "Reserve room for the answer", text: "Output tokens come out of the same window, and many APIs also have a separate maximum output length. Leave enough space for the longest answer you expect." },
      { title: "Use retrieval for large knowledge bases", text: "Retrieval-augmented generation (RAG) searches your documents and sends only the most relevant chunks, instead of the whole collection every time." },
      { title: "Trim logs and data", text: "Remove repeated log lines, base64 blobs and unneeded JSON fields before sending. They use many tokens and add little meaning." },
    ],
    faq: [
      { q: "What happens if I exceed the context window?", a: "Most APIs reject the request with an error. Chat apps usually drop or summarize older messages silently, which is why long chats can \"forget\" earlier details." },
      { q: "Does the context window include the model's answer?", a: "Yes. Input plus output must fit within the window, and the output may also be capped by a separate maximum output setting." },
      { q: "How do I find a model's context window?", a: "Check the provider's model documentation. Limits differ between models and sometimes between API tiers, and they change as new versions are released." },
      { q: "Is my text sent anywhere?", a: "No. The estimate is calculated in your browser." },
    ],
    related: [
      { href: "/ai/token-counter/", label: "Token Counter & Cost Estimator" },
      { href: "/ai/model-comparison/", label: "AI Model Comparison" },
      { href: "/ai/glossary/", label: "AI Glossary" },
      { href: "/ai/prompt-library/", label: "Prompt Library" },
    ],
  },

  "command-explainer": {
    heading: "How to read an unfamiliar command before you run it",
    intro: [
      "Copying commands from documentation, tickets, chat or AI assistants is part of everyday operations work, and so is the risk of running something you don't fully understand. A single flag like `--delete` in rsync, `-rf` in rm or `--force` in kubectl can change a harmless command into a destructive one.",
      "This explainer splits a command into its parts and describes the ones it recognizes: the base tool (kubectl, docker, git, systemctl, ssh, curl, rsync, chmod, chown, tar, find, grep) and common flags such as `-n`, `-o`, `-f`, `-r`, `--rm`, `-it`, `--delete` and `--dry-run`. It never executes anything; it only reads the text you paste.",
    ],
    steps: [
      "Paste a single command, or click Load example.",
      "Click Explain command.",
      "Read the breakdown and check each flag against what you intend to do.",
      "For anything destructive, run the command's dry-run or preview mode first, and check its manual page (`man rsync`, `kubectl delete --help`).",
    ],
    examples: [
      {
        title: "A risky rsync, explained",
        code: "rsync -av --delete /data/ backup01:/backup/data/",
        text: "`-a` keeps permissions and timestamps, `-v` lists files, and `--delete` removes files on the destination that no longer exist in the source. The trailing slash on `/data/` means \"the contents of data\". Without it, rsync creates `/backup/data/data`. Run with `--dry-run` first.",
      },
      {
        title: "Previewing changes safely",
        code: "rsync -av --delete --dry-run /data/ backup01:/backup/data/\nkubectl apply -f deploy.yaml --dry-run=server\nkubectl diff -f deploy.yaml\nansible-playbook site.yml --check --diff",
        text: "Most tools that can do damage also have a preview mode. Make using it a habit for production changes.",
      },
    ],
    tips: [
      { title: "Watch for pipes to a shell", text: "`curl https://... | bash` runs a remote script without letting you read it. Download it, read it, then run it." },
      { title: "Check the current context", text: "For kubectl, confirm the cluster and namespace with `kubectl config current-context` before running delete or apply." },
      { title: "Beware of wildcards and variables", text: "`rm -rf $DIR/*` deletes from the root directory if `$DIR` is empty. Use `set -u` in scripts and quote variables." },
      { title: "AI-generated commands need review", text: "AI assistants can produce commands with wrong flags or options from other versions. Treat them like commands from a colleague: understand them before running them." },
    ],
    faq: [
      { q: "Does this tool run my command?", a: "No. It only analyzes the text in your browser. Nothing is executed or sent to a server." },
      { q: "Why isn't every flag explained?", a: "It recognizes common tools and flags. Flags mean different things in different commands, so check the tool's `--help` or man page for anything it doesn't cover." },
      { q: "How can I learn what a Linux command does quickly?", a: "`man command` gives the full manual, `command --help` a summary, and `tldr command` (if installed) shows practical examples." },
      { q: "What commands should I be most careful with?", a: "Anything that deletes, overwrites or changes permissions recursively, such as `rm -rf`, `chmod -R`, `chown -R`, `rsync --delete`, `kubectl delete`, `dd` and `mkfs`." },
    ],
    related: [
      { href: "/linux/chmod-calculator/", label: "chmod Calculator" },
      { href: "/linux/rsync-command-generator/", label: "Rsync Command Generator" },
      { href: "/linux/file-finder-command/", label: "find Command Generator" },
      { href: "/ai/prompt-library/", label: "Prompt Library" },
    ],
  },

  "model-comparison": {
    heading: "How to choose the right AI model for a task",
    intro: [
      "The major model families (OpenAI GPT, Anthropic Claude and Google Gemini) each offer several tiers, from fast, low-cost models to larger models built for difficult reasoning, coding and agent work. Picking the right tier matters more than picking the brand: the most capable model is often slower and several times more expensive than you need for simple tasks.",
      "This page compares the families side by side by provider, context size, pricing references and typical use. Model names, limits and prices change frequently, so use it to shortlist options and always confirm the details in the provider's official documentation before making decisions.",
    ],
    steps: [
      "Filter by provider, or compare all of them.",
      "Define your task: classification, summarization, coding, long-document analysis, agents or multimodal input such as images and PDFs.",
      "Shortlist two or three models, including at least one smaller, cheaper tier.",
      "Test them on 20–50 real examples from your own workload and compare quality, latency and cost.",
    ],
    examples: [
      {
        title: "Matching model tier to workload",
        text: "Ticket classification, extraction and short summaries usually work well on small, fast models. Code review, complex troubleshooting and multi-step agents benefit from the most capable tiers. Long-document work needs a large context window and good long-context recall.",
      },
      {
        title: "A simple evaluation sheet",
        code: "Task: summarize incident tickets (50 real samples)\nModel A: accuracy 46/50, avg latency 2.1s, cost per 1,000 tickets ...\nModel B: accuracy 48/50, avg latency 5.8s, cost per 1,000 tickets ...\nDecision: Model A for the default path; Model B for escalated tickets",
        text: "A small, honest test on your own data beats any public benchmark for deciding what to use.",
      },
    ],
    tips: [
      { title: "Benchmarks aren't your workload", text: "Public leaderboards measure general ability. Your prompts, data and quality bar are what matter. Build a small test set and reuse it whenever you evaluate a new model." },
      { title: "Route by difficulty", text: "Many teams send easy requests to a cheap model and hard ones to a strong model. This can cut costs substantially without lowering quality." },
      { title: "Check data and compliance terms", text: "For company data, check each provider's data retention, training policy, regional hosting and certifications, or use the model through your cloud provider (AWS Bedrock, Azure, Google Vertex AI)." },
      { title: "Plan for model updates", text: "Providers retire older model versions. Pin versions in production and schedule time to re-test when you upgrade." },
    ],
    faq: [
      { q: "Which AI model is best?", a: "It depends on the task, budget and latency needs. The best approach is to test two or three candidates on your own examples." },
      { q: "Why doesn't this page list exact prices?", a: "Prices and model lineups change frequently. The provider's pricing page is always the source of truth." },
      { q: "What does context size mean?", a: "The maximum amount of text, measured in tokens, a model can consider in one request, including its answer. See the Context Window Calculator." },
      { q: "Can I use these models without sending data to the provider?", a: "Hosted APIs process your data on the provider's servers. For strict requirements, use enterprise or cloud-hosted offerings with contractual data protections, or run an open-weight model yourself." },
    ],
    related: [
      { href: "/ai/token-counter/", label: "Token Counter & Cost Estimator" },
      { href: "/ai/context-window-calculator/", label: "Context Window Calculator" },
      { href: "/ai/claude-certifications/", label: "Claude Certifications" },
      { href: "/ai/glossary/", label: "AI Glossary" },
    ],
  },
};
