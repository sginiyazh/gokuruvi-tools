import type { ToolGuideContent } from "./types";

export const securityGuides: Record<string, ToolGuideContent> = {
  "hash-generator": {
    heading: "How to use the Hash Generator",
    intro: [
      "A cryptographic hash turns any input into a fixed-length fingerprint. The same input always produces the same hash, and changing a single character produces a completely different result. That makes hashes useful for checking that text has not changed, comparing values without storing the originals, and building cache keys or deduplication IDs.",
      "This tool uses your browser's built-in Web Crypto API (`crypto.subtle.digest`). The text you type is hashed on your own device and is never sent to a server, so you can safely hash configuration snippets or internal identifiers.",
      "It supports the SHA-2 family: SHA-256 (64 hex characters), SHA-384 (96) and SHA-512 (128). MD5 and SHA-1 are deliberately not offered because practical collision attacks exist for both, and they should not be used for anything security-related.",
    ],
    steps: [
      "Choose an algorithm. SHA-256 is the right default for almost everything.",
      "Paste or type your text into the Text box. Whitespace counts: a trailing space or newline changes the hash.",
      "Click Generate Hash. The result appears as lowercase hexadecimal.",
      "Click Copy to put the hash on your clipboard, then compare it with the value you expect.",
    ],
    examples: [
      {
        title: "Checking your result against the command line",
        code: "# Linux / macOS (-n stops echo adding a newline)\necho -n 'hello' | sha256sum\n\n# Windows PowerShell\n$b = [Text.Encoding]::UTF8.GetBytes('hello')\n[BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($b)).Replace('-','').ToLower()",
        text: "Both commands print `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824` for the word hello, the same value this tool gives. If you forget `-n`, echo adds a newline and you get a different hash. This is the most common reason hashes \"don't match\".",
      },
      {
        title: "Detecting a changed configuration value",
        text: "Hash an API endpoint list or a firewall rule set before and after a change window. If the two SHA-256 values match, the content is identical byte for byte, without anyone having to diff long text by eye.",
      },
    ],
    tips: [
      { title: "Hashing is not encryption", text: "A hash cannot be reversed back into the original text. If you need to recover the data later, use encryption instead." },
      { title: "Never store passwords with plain SHA-256", text: "Fast hashes can be brute-forced at billions of guesses per second on a GPU. Store passwords with a slow, salted algorithm such as Argon2id, bcrypt or scrypt." },
      { title: "Encoding matters", text: "This tool hashes the UTF-8 bytes of your text. Tools that use UTF-16 or add a byte-order mark will produce different hashes for text that looks identical." },
      { title: "Line endings", text: "Text copied from Windows files may contain CRLF (`\\r\\n`) line endings, while Linux uses LF. The hashes will differ even though the text looks the same." },
    ],
    faq: [
      { q: "Is my text uploaded anywhere?", a: "No. Hashing runs entirely in your browser using the Web Crypto API. Nothing you type is sent to Gokuruvi or any other server." },
      { q: "Which algorithm should I choose?", a: "Use SHA-256 unless a system specifically asks for SHA-384 or SHA-512. All three are secure today. The longer variants just produce longer output." },
      { q: "Why doesn't my hash match the one from another tool?", a: "Almost always the input differs: a trailing newline, extra spaces, different line endings or a different text encoding. Hash the exact same bytes and the results will match." },
      { q: "Can I hash a file with this tool?", a: "This page hashes text. To hash a file such as an ISO or installer, use the File Checksum Generator, which reads the file locally in your browser." },
    ],
    related: [
      { href: "/security/file-checksum-generator/", label: "File Checksum Generator" },
      { href: "/security/hmac-generator/", label: "HMAC Generator" },
      { href: "/security/sri-hash-generator/", label: "SRI Hash Generator" },
      { href: "/network/password-generator/", label: "Password Generator" },
    ],
  },

  "hmac-generator": {
    heading: "How to use the HMAC Generator",
    intro: [
      "HMAC (Hash-based Message Authentication Code) combines a secret key with a message to produce a signature. Anyone who knows the key can recompute the signature and confirm two things: the message has not been changed, and it was created by someone holding the same key.",
      "HMAC is everywhere in day-to-day engineering. Stripe, GitHub, Slack and Shopify sign their webhooks with HMAC-SHA256. AWS Signature Version 4 is built on HMAC. HS256 JSON Web Tokens are signed with HMAC too. This tool helps you reproduce those signatures while you debug an integration.",
      "The calculation runs locally with the Web Crypto API, so your secret key never leaves your browser.",
    ],
    steps: [
      "Choose the hash algorithm the other system uses. For most webhooks this is SHA-256.",
      "Enter the shared secret key exactly as configured, without extra spaces or quotes.",
      "Paste the message. For webhooks this must be the raw request body, byte for byte, not a re-formatted copy.",
      "Click Generate to get the hexadecimal signature, then compare it with the signature header you received.",
    ],
    examples: [
      {
        title: "Verifying a GitHub webhook",
        code: "X-Hub-Signature-256: sha256=<hex signature>\n\n# Reproduce it on the command line\nprintf '%s' \"$BODY\" | openssl dgst -sha256 -hmac \"$SECRET\"",
        text: "GitHub sends `sha256=` followed by the HMAC-SHA256 of the raw payload. Paste the payload and your webhook secret into this tool, and the hex output should equal the part after `sha256=`.",
      },
      {
        title: "Why the signature doesn't match",
        text: "If your framework parses the JSON and you re-serialize it, key order and whitespace change, and so does the signature. Always sign or verify the raw body as received.",
      },
    ],
    tips: [
      { title: "Hex vs Base64", text: "This tool outputs hex. Some providers, for example Shopify, send the signature in Base64 instead. The bytes are the same but the encoding differs, so convert before comparing." },
      { title: "Use constant-time comparison in code", text: "When verifying signatures in production, compare with a timing-safe function such as `crypto.timingSafeEqual` in Node.js or `hmac.compare_digest` in Python, not `==`." },
      { title: "Include the timestamp if the provider does", text: "Stripe and Slack sign `timestamp + '.' + body` (Stripe) or `v0:timestamp:body` (Slack) to prevent replay attacks. Build the exact same string before hashing." },
      { title: "Rotate leaked secrets", text: "If a webhook secret appears in logs or source control, rotate it. Anyone holding it can forge valid signatures." },
    ],
    faq: [
      { q: "What is the difference between a hash and an HMAC?", a: "A plain hash can be computed by anyone. An HMAC needs the secret key, so it proves both integrity and who created it. A hash only proves integrity." },
      { q: "Is my secret key sent to your server?", a: "No. The HMAC is computed in your browser with the Web Crypto API and nothing is transmitted." },
      { q: "Which algorithm do webhooks use?", a: "The vast majority use HMAC-SHA256. Check the provider's documentation for the header name and whether they encode the result in hex or Base64." },
      { q: "Can HMAC be reversed to find the key?", a: "No. With a strong random key, HMAC-SHA256 cannot practically be reversed or forged. Weak, guessable keys can still be brute-forced, so use at least 32 random bytes." },
    ],
    related: [
      { href: "/security/hash-generator/", label: "Hash Generator" },
      { href: "/security/jwt-decoder/", label: "JWT Decoder" },
      { href: "/devops/base64-encoder/", label: "Base64 Encoder" },
      { href: "/network/password-generator/", label: "Password Generator" },
    ],
  },

  "file-checksum-generator": {
    heading: "How to verify a download with the File Checksum Generator",
    intro: [
      "A checksum is a hash of a file's contents. Software vendors publish checksums next to their downloads so you can confirm the file you received is exactly the file they released. It catches corrupted downloads, truncated transfers and tampered mirrors.",
      "This tool reads your file with the browser's File API and hashes it with Web Crypto. The file is never uploaded, which matters when you are checking internal builds, backups or ISO images you are not allowed to share.",
      "It supports SHA-256, SHA-384 and SHA-512. SHA-256 is what most vendors publish today, including Ubuntu, Rocky Linux, VMware and HashiCorp.",
    ],
    steps: [
      "Download the file and the vendor's checksum from the official site, ideally over HTTPS.",
      "Choose the file with the File picker. Nothing is uploaded; the file is read locally.",
      "Select the same algorithm the vendor used. Their checksum file is usually named SHA256SUMS or ends in .sha256.",
      "Generate the checksum and compare it with the published value. Every character must match.",
    ],
    examples: [
      {
        title: "Checking an ISO on Linux or Windows",
        code: "# Linux\nsha256sum rhel-9.4-x86_64-dvd.iso\n\n# Windows PowerShell\nGet-FileHash .\\rhel-9.4-x86_64-dvd.iso -Algorithm SHA256\n\n# Windows Command Prompt\ncertutil -hashfile rhel-9.4-x86_64-dvd.iso SHA256",
        text: "All three commands give the same value as this tool for the same file. PowerShell prints it in uppercase. Hex comparison is case-insensitive, so that is fine.",
      },
      {
        title: "Confirming a backup copy",
        text: "After copying a database dump or VM export to another site, generate the checksum at both ends. Matching values prove the copy is complete and uncorrupted before you delete the source.",
      },
    ],
    tips: [
      { title: "Get the checksum from a trusted place", text: "If an attacker can replace the download, they can often replace a checksum on the same page too. Prefer checksums that are signed with GPG, or published on a different, trusted channel." },
      { title: "Very large files take time", text: "Browsers must read the whole file into memory. Multi-gigabyte ISOs work but can be slow; for files above a few GB, the command-line tools above are faster." },
      { title: "A mismatch means don't use it", text: "Even one differing character means the file is different. Download it again from the official source instead of trying to install it." },
    ],
    faq: [
      { q: "Is my file uploaded?", a: "No. The file is read and hashed inside your browser. It never leaves your computer." },
      { q: "Should I use MD5 or SHA-1 checksums?", a: "Only when the vendor publishes nothing else, and only to detect accidental corruption. They are not safe against deliberate tampering. Prefer SHA-256." },
      { q: "Why is my checksum in lowercase while the vendor's is uppercase?", a: "Hexadecimal is case-insensitive. `AB12` and `ab12` are the same value, so the checksum still matches." },
      { q: "What is the difference between a checksum and a signature?", a: "A checksum proves the file matches a published value. A GPG or code signature also proves who published it, which protects you if the website itself is compromised." },
    ],
    related: [
      { href: "/security/hash-generator/", label: "Hash Generator" },
      { href: "/security/sri-hash-generator/", label: "SRI Hash Generator" },
      { href: "/linux/openssl-command-generator/", label: "OpenSSL Command Generator" },
      { href: "/linux/rsync-command-generator/", label: "Rsync Command Generator" },
    ],
  },

  "jwt-decoder": {
    heading: "How to decode and inspect a JWT",
    intro: [
      "A JSON Web Token (JWT) has three parts separated by dots: a header, a payload and a signature. The header and payload are just Base64URL-encoded JSON, which means anyone can read them. They are signed, not encrypted.",
      "This decoder turns the first two parts back into readable JSON so you can check claims such as who the token was issued to, when it expires and which permissions it carries. It is the fastest way to debug \"401 Unauthorized\" errors from APIs and single sign-on (SSO) integrations.",
      "Decoding happens in your browser. The token is not sent anywhere, and the tool does not verify the signature. Only the server holding the key can do that.",
    ],
    steps: [
      "Copy the token. It usually comes from an `Authorization: Bearer ...` header, a cookie, or your identity provider's debug output.",
      "Paste it into the JWT box. It should look like `xxxxx.yyyyy.zzzzz`.",
      "Click Decode to see the header (algorithm and key ID) and payload (the claims).",
      "Check the claims described below, especially `exp`, `aud` and `iss`, against what your API expects.",
    ],
    examples: [
      {
        title: "Reading the standard claims",
        code: "{\n  \"iss\": \"https://login.example.com/\",\n  \"sub\": \"user-1234\",\n  \"aud\": \"api://orders\",\n  \"exp\": 1790000000,\n  \"iat\": 1789996400,\n  \"scope\": \"orders.read\"\n}",
        text: "`iss` is who issued the token, `sub` is the user or client, `aud` is the API it is meant for, and `exp`/`iat` are expiry and issue times in Unix seconds. If `aud` doesn't match your API, or `exp` is in the past, the API will reject the token.",
      },
      {
        title: "Converting exp to a readable date",
        code: "# Linux\ndate -d @1790000000\n\n# PowerShell\n[DateTimeOffset]::FromUnixTimeSeconds(1790000000).LocalDateTime",
        text: "Compare the result with the current time. Clock drift on the server of more than a few minutes can also cause valid tokens to be rejected.",
      },
    ],
    tips: [
      { title: "Never put secrets in a JWT payload", text: "Because the payload is only encoded, passwords, API keys or personal data inside it are visible to anyone who sees the token." },
      { title: "Reject alg: none", text: "Servers must pin the expected algorithm, such as RS256 or HS256, and reject tokens with `\"alg\": \"none\"` or an unexpected algorithm." },
      { title: "Treat tokens like passwords", text: "A valid token grants access until it expires. Don't paste production tokens into tools that send them to a server, or into tickets and chat." },
      { title: "Check the kid header", text: "If signature validation fails after a key rotation, compare the `kid` in the header with the keys in the issuer's JWKS endpoint." },
    ],
    faq: [
      { q: "Does this tool verify the signature?", a: "No. It only decodes. Signature verification needs the issuer's secret or public key and should be done by your API or a JWT library." },
      { q: "Is it safe to paste a real token here?", a: "Decoding happens locally in your browser and nothing is transmitted. Still, prefer expired or test tokens where possible." },
      { q: "Why does my token show 'Invalid JWT'?", a: "The token is probably incomplete, wrapped in quotes, or includes the word `Bearer`. Paste only the three dot-separated parts." },
      { q: "What is the difference between HS256 and RS256?", a: "HS256 uses one shared secret for signing and verifying (HMAC). RS256 signs with a private key and verifies with a public key, which is safer when many services need to verify tokens." },
    ],
    related: [
      { href: "/devops/jwt-decoder/", label: "DevOps JWT Decoder" },
      { href: "/security/hmac-generator/", label: "HMAC Generator" },
      { href: "/devops/base64-decoder/", label: "Base64 Decoder" },
      { href: "/security/security-headers-analyzer/", label: "Security Headers Analyzer" },
    ],
  },

  "password-strength-checker": {
    heading: "How the Password Strength Checker works",
    intro: [
      "This checker scores a password against seven practical rules: at least 12 characters, at least 16 characters, an uppercase letter, a lowercase letter, a number, a symbol, and no character repeated three or more times in a row. Passing all seven rates as Strong, five or six as Moderate, and fewer as Weak.",
      "The check runs entirely in your browser. The password field is never submitted, stored or logged, so you can test real password patterns. Even so, the safest habit is to test a similar password rather than the real one.",
      "Rules like these are a quick sanity check, not a guarantee. The biggest factor in real-world strength is length combined with unpredictability. A long random passphrase beats a short password full of symbols.",
    ],
    steps: [
      "Type a password into the field. The checklist updates on every keystroke.",
      "Use Show / Hide to reveal the text and check for typos.",
      "Read the checklist to see which rules pass (✓) and which fail (✗).",
      "Aim for Strong, and above all for length: 16 or more characters.",
    ],
    examples: [
      {
        title: "Why length wins",
        text: "`P@ssw0rd!` passes the character-type rules but is only 9 characters and is among the first guesses in any cracking dictionary. `harbor-violet-copper-sunrise-42` is longer, easier to remember and far harder to guess.",
      },
      {
        title: "A policy that matches current guidance",
        text: "NIST SP 800-63B recommends a minimum of 8 characters (15 for single-factor authentication), allowing at least 64, checking new passwords against lists of breached passwords, and not forcing periodic rotation unless a compromise is suspected.",
      },
    ],
    tips: [
      { title: "Predictable substitutions don't help much", text: "Swapping `a` for `@` or `o` for `0` is built into every cracking tool's rules. It adds very little strength." },
      { title: "Never reuse passwords", text: "Reuse is the main way one breach becomes many. A password manager lets every account have a unique random password." },
      { title: "Turn on MFA", text: "Multi-factor authentication protects the account even if the password leaks. Prefer an authenticator app or a hardware key over SMS." },
      { title: "Service accounts need strength too", text: "Database, backup and application service passwords are prime targets. Generate long random values and store them in a vault." },
    ],
    faq: [
      { q: "Is my password sent anywhere?", a: "No. The field is not part of any form submission, and all checks run in JavaScript inside your browser." },
      { q: "Why does a 12-character password only rate Moderate?", a: "The Strong rating requires every rule to pass, including 16 or more characters. Longer passwords are much harder to brute-force." },
      { q: "Does this check whether my password has been breached?", a: "No. To check that, use a service such as Have I Been Pwned's Pwned Passwords, which uses k-anonymity so your full password is never sent." },
      { q: "What makes a good passphrase?", a: "Four or more random, unrelated words, ideally chosen by a generator rather than by you, plus a number or separator if a site requires one." },
    ],
    related: [
      { href: "/network/password-generator/", label: "Password Generator" },
      { href: "/security/hash-generator/", label: "Hash Generator" },
      { href: "/guides/linux-security-hardening/", label: "Linux Security Hardening Guide" },
      { href: "/windows/user-management-generator/", label: "Local User Management Generator" },
    ],
  },

  "security-headers-analyzer": {
    heading: "How to check your website's security headers",
    intro: [
      "HTTP security headers tell the browser how to protect your visitors: which scripts may run, whether the site must always use HTTPS, and whether other sites may embed your pages. They are one of the cheapest security improvements you can make, and scanners and auditors check for them.",
      "Paste the response headers from your site and this tool checks for six recommended headers: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and Cross-Origin-Opener-Policy. It only reads the text you paste, so it works for internal and staging sites too.",
    ],
    steps: [
      "Get the headers with `curl -sI https://your-site.example` or from your browser's developer tools (Network tab, click the first request, then Response Headers).",
      "Paste the full header block into the text area.",
      "Click Analyze Headers to see how many of the six headers are present.",
      "For each missing header, add it in your web server, CDN or application, then run the check again.",
    ],
    examples: [
      {
        title: "A solid baseline set",
        code: "Strict-Transport-Security: max-age=31536000; includeSubDomains\nContent-Security-Policy: default-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'self'\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nPermissions-Policy: camera=(), microphone=(), geolocation=()\nCross-Origin-Opener-Policy: same-origin",
        text: "Start with these and relax the CSP only where your site needs it, for example to allow an analytics or ads domain.",
      },
      {
        title: "Adding headers in Nginx",
        code: "add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;\nadd_header X-Content-Type-Options \"nosniff\" always;\nadd_header Referrer-Policy \"strict-origin-when-cross-origin\" always;",
        text: "The `always` flag makes Nginx add the header to error responses too. On Cloudflare you can add them with Transform Rules; on IIS use `customHeaders` in web.config.",
      },
    ],
    tips: [
      { title: "Roll out HSTS carefully", text: "Once a browser sees `Strict-Transport-Security`, it refuses plain HTTP for the whole max-age. Start with a short max-age, confirm every subdomain supports HTTPS, then increase it." },
      { title: "Test CSP in report-only mode first", text: "Use `Content-Security-Policy-Report-Only` to see what would break before you enforce the policy." },
      { title: "X-Frame-Options is legacy", text: "`frame-ancestors` in CSP replaces it. Keeping `X-Frame-Options: SAMEORIGIN` as well does no harm for older browsers." },
      { title: "Remove information leaks", text: "Headers like `Server: Apache/2.4.41` or `X-Powered-By: PHP/7.4` tell attackers which versions to target. Remove or genericize them." },
    ],
    faq: [
      { q: "Does this tool fetch my site?", a: "No. It analyzes only the header text you paste, so it works for private, internal and staging environments." },
      { q: "Which header matters most?", a: "Strict-Transport-Security and Content-Security-Policy provide the most protection. CSP is the strongest defense against cross-site scripting." },
      { q: "Will adding these headers break my site?", a: "Most won't. CSP is the one that can block scripts, styles or images, so build it gradually and test it in report-only mode first." },
      { q: "Is X-XSS-Protection still needed?", a: "No. Modern browsers have removed the XSS auditor it controlled. Use a Content-Security-Policy instead." },
    ],
    related: [
      { href: "/security/csp-generator/", label: "CSP Generator" },
      { href: "/network/ssl-checker/", label: "SSL Certificate Checker" },
      { href: "/security/sri-hash-generator/", label: "SRI Hash Generator" },
      { href: "/windows/iis-command-generator/", label: "IIS Command Generator" },
    ],
  },

  "sri-hash-generator": {
    heading: "How to add Subresource Integrity to scripts and stylesheets",
    intro: [
      "Subresource Integrity (SRI) protects your site when it loads JavaScript or CSS from a CDN. You add an `integrity` attribute containing a hash of the exact file you expect. If the CDN is compromised or the file changes, the browser refuses to run it.",
      "This tool builds the integrity value for you. Paste the file's content, choose the algorithm, and it outputs a string like `sha384-...` ready to drop into your HTML. The hash is calculated locally in your browser.",
    ],
    steps: [
      "Download the exact file version you will reference, for example `https://cdn.example.com/lib@3.2.1/lib.min.js`.",
      "Paste its full content into the Resource content box without changing anything.",
      "Keep SHA-384, the most common choice for SRI, and click Generate SRI.",
      "Add the value to your tag together with `crossorigin=\"anonymous\"`.",
    ],
    examples: [
      {
        title: "Using the generated value",
        code: "<script src=\"https://cdn.example.com/lib@3.2.1/lib.min.js\"\n        integrity=\"sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC\"\n        crossorigin=\"anonymous\"></script>",
        text: "The browser downloads the file, hashes it and compares the result with the integrity value. If they differ, the script is blocked and an error appears in the console.",
      },
      {
        title: "Generating it on the command line",
        code: "curl -s https://cdn.example.com/lib@3.2.1/lib.min.js | openssl dgst -sha384 -binary | openssl base64 -A",
        text: "Put `sha384-` in front of the output. It should equal this tool's result for the same content.",
      },
    ],
    tips: [
      { title: "Always pin a version", text: "SRI only works with URLs that never change. A `latest` URL will eventually serve a new file, fail the check and break your site." },
      { title: "crossorigin is required", text: "For cross-origin resources, the browser needs `crossorigin=\"anonymous\"` and a CDN that sends CORS headers, otherwise the integrity check cannot run." },
      { title: "Paste the exact bytes", text: "Re-formatting, minifying or changing line endings changes the hash. Copy the file exactly as the CDN serves it." },
      { title: "Don't use SRI on dynamic resources", text: "Scripts that change per request, such as ad or analytics loaders, can't use SRI. Limit them with a Content-Security-Policy instead." },
    ],
    faq: [
      { q: "Which algorithm should I use?", a: "SHA-384 is the most widely used for SRI and is what most CDNs publish. SHA-256 and SHA-512 are also supported by all modern browsers." },
      { q: "What happens if the hash doesn't match?", a: "The browser refuses to execute the script or apply the stylesheet and logs an integrity error in the console." },
      { q: "Do I need SRI for files on my own domain?", a: "It's mainly for third-party CDNs. For your own files, HTTPS and a strong CSP are usually enough." },
      { q: "Can I list more than one hash?", a: "Yes. Separate values with spaces, for example `sha384-... sha512-...`. The browser uses the strongest algorithm it supports." },
    ],
    related: [
      { href: "/security/csp-generator/", label: "CSP Generator" },
      { href: "/security/hash-generator/", label: "Hash Generator" },
      { href: "/security/security-headers-analyzer/", label: "Security Headers Analyzer" },
      { href: "/security/file-checksum-generator/", label: "File Checksum Generator" },
    ],
  },

  "csp-generator": {
    heading: "How to build a Content Security Policy",
    intro: [
      "A Content Security Policy (CSP) is an HTTP header that tells the browser which sources of scripts, styles, images and connections your site trusts. If an attacker injects a script tag through a cross-site scripting (XSS) bug, the browser refuses to run it because its source isn't on the list.",
      "This generator builds a complete header from six directives: `default-src`, `script-src`, `style-src`, `img-src`, `connect-src` and `frame-ancestors`. It always adds two safe defaults, `base-uri 'self'` and `object-src 'none'`, which block common injection tricks.",
    ],
    steps: [
      "Start strict: keep `'self'` for default-src, script-src and style-src.",
      "Add each external domain your site really uses. For example, add `https://pagead2.googlesyndication.com` to script-src if you run Google AdSense, or an API host to connect-src.",
      "Set frame-ancestors to `'self'` (or `'none'`) to stop other sites from framing your pages for clickjacking.",
      "Click Generate, deploy the header in report-only mode first, fix any violations, then enforce it.",
    ],
    examples: [
      {
        title: "A typical policy for a site with analytics",
        code: "Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
        text: "`'unsafe-inline'` for styles is a common, lower-risk compromise. Avoid it for script-src, because that defeats most of CSP's XSS protection.",
      },
      {
        title: "Testing without breaking production",
        code: "Content-Security-Policy-Report-Only: default-src 'self'; ...",
        text: "The report-only header logs violations in the browser console without blocking anything. Browse every page, add the sources you really need, then switch to the enforcing header.",
      },
    ],
    tips: [
      { title: "Avoid 'unsafe-inline' and 'unsafe-eval' in script-src", text: "They allow exactly the kind of script an attacker would inject. Move inline scripts into files, or use nonces or hashes instead." },
      { title: "Don't use wildcards like https: for scripts", text: "Allowing every HTTPS host lets an attacker load scripts from any server they control." },
      { title: "Check third-party requirements", text: "Ad networks, chat widgets and payment forms often load from several domains. Their documentation usually lists the exact CSP entries they need." },
      { title: "One policy per response", text: "If both your app and a CDN add a CSP header, browsers enforce both, and a resource must pass every policy. Keep a single source of truth." },
    ],
    faq: [
      { q: "Where do I add the CSP header?", a: "In your web server (Nginx `add_header`, Apache `Header set`, IIS `customHeaders`), your CDN (Cloudflare Transform Rules), or your application framework's middleware." },
      { q: "Can I set CSP with a meta tag?", a: "Yes, with `<meta http-equiv=\"Content-Security-Policy\" content=\"...\">`, but frame-ancestors and report-only mode don't work in meta tags. The HTTP header is preferred." },
      { q: "What does default-src do?", a: "It's the fallback for any resource type you don't list explicitly, such as fonts or media. Setting it to `'self'` keeps unlisted types restricted." },
      { q: "Will CSP slow my site down?", a: "No. The browser evaluates the policy locally with no measurable performance cost." },
    ],
    related: [
      { href: "/security/security-headers-analyzer/", label: "Security Headers Analyzer" },
      { href: "/security/sri-hash-generator/", label: "SRI Hash Generator" },
      { href: "/network/ssl-checker/", label: "SSL Certificate Checker" },
      { href: "/security/jwt-decoder/", label: "JWT Decoder" },
    ],
  },
};
