import type { ToolGuideContent } from "./types";

export const networkGuides: Record<string, ToolGuideContent> = {
  "abuseipdb-check": {
    heading: "How to check an IP address reputation with AbuseIPDB",
    intro: [
      "AbuseIPDB is a community database where system administrators report IP addresses that attack their servers: SSH brute-force, web exploit scanning, spam, DDoS and more. Each IP gets an abuse confidence score from 0 to 100% based on how many reports it has, how recent they are, and how trusted the reporters are.",
      "This tool looks up a public IPv4 or IPv6 address using your own free AbuseIPDB API key. It shows the confidence score, total report count, country, ISP, domain and when the IP was last reported. That is usually enough to decide whether an address in your firewall or web server logs is a known attacker or just a normal visitor.",
      "Your key is forwarded only for this single lookup and is not stored.",
    ],
    steps: [
      "Create a free account at abuseipdb.com and generate an API key under Account → API. The free tier allows 1,000 checks per day.",
      "Paste the suspicious IP address, for example one from `/var/log/secure`, an IIS log or a firewall alert.",
      "Paste your API key and click Check.",
      "Read the abuse score and report count, then decide whether to block the IP, monitor it or ignore it.",
    ],
    examples: [
      {
        title: "Finding IPs worth checking on a Linux server",
        code: "# Top sources of failed SSH logins (RHEL/Rocky)\ngrep 'Failed password' /var/log/secure | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head\n\n# Ubuntu/Debian\ngrep 'Failed password' /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head",
        text: "Check the top few addresses here. A score above about 75% with dozens of reports is almost certainly an automated attacker.",
      },
      {
        title: "Blocking a confirmed attacker",
        code: "# firewalld\nfirewall-cmd --permanent --add-rich-rule='rule family=\"ipv4\" source address=\"203.0.113.50\" reject'\nfirewall-cmd --reload",
        text: "For ongoing protection, tools like fail2ban or CrowdSec block repeat offenders automatically, and can also report them back to AbuseIPDB.",
      },
    ],
    tips: [
      { title: "A score of 0 doesn't mean safe", text: "New attack infrastructure often has no reports yet. Treat the score as one signal alongside your own logs." },
      { title: "Watch out for shared IPs", text: "Cloud providers, VPNs, mobile carriers and corporate NAT gateways put many users behind one address. Blocking a high-scoring cloud IP may also block legitimate traffic." },
      { title: "Private addresses can't be checked", text: "Addresses like `10.x`, `172.16–31.x` and `192.168.x` are internal and never appear in AbuseIPDB. Look up the public IP instead." },
      { title: "Report back", text: "If an IP attacks you, reporting it through your AbuseIPDB account helps other administrators." },
    ],
    faq: [
      { q: "Is the AbuseIPDB API free?", a: "Yes. The free plan includes 1,000 IP checks per day, which is plenty for manual investigation. Paid plans raise the limits." },
      { q: "What abuse confidence score should I block?", a: "Many administrators block automatically at 90% or more and review anything between 25% and 90%. Adjust the threshold to how sensitive your service is." },
      { q: "Is my API key stored?", a: "No. The key is sent with your single lookup request and is not saved or logged by Gokuruvi Tools." },
      { q: "Does this work for IPv6?", a: "Yes. AbuseIPDB accepts both IPv4 and IPv6 addresses." },
    ],
    related: [
      { href: "/network/what-is-my-ip/", label: "What Is My IP" },
      { href: "/network/dns-checker/", label: "DNS Checker" },
      { href: "/linux/firewall-cmd-generator/", label: "firewall-cmd Generator" },
      { href: "/linux/iptables-generator/", label: "iptables Generator" },
    ],
  },

  "bandwidth-calculator": {
    heading: "How to estimate file transfer time",
    intro: [
      "Before you start a large backup, VM migration or data copy, it helps to know whether it will take ten minutes or ten hours. This calculator estimates the ideal transfer time from the amount of data and the link speed.",
      "The formula is simple: time = (size in bytes × 8) ÷ speed in bits per second. Storage is measured in bytes (MB, GB, TB) and network speed in bits (Mbps, Gbps), and mixing the two up is the most common estimation mistake. The calculator uses decimal units: 1 GB = 1,000,000,000 bytes and 1 Mbps = 1,000,000 bits per second, as network vendors do.",
    ],
    steps: [
      "Enter the data size and choose MB, GB or TB.",
      "Enter the bandwidth you actually get, not just the advertised plan speed, and choose Kbps, Mbps or Gbps.",
      "Click Calculate to see the estimated time in hours, minutes and seconds.",
      "Add a safety margin of 10–30% for protocol overhead, latency and other traffic sharing the link.",
    ],
    examples: [
      {
        title: "Copying a 500 GB VM to a DR site over 100 Mbps",
        text: "500 GB × 8 = 4,000,000 megabits ÷ 100 Mbps = 40,000 seconds, about 11 hours 7 minutes. In practice, plan for 13–14 hours, or schedule the copy over a weekend.",
      },
      {
        title: "Measuring real throughput first",
        code: "# On the receiving server\niperf3 -s\n\n# On the sending server\niperf3 -c dr-server.example.com -t 30",
        text: "iperf3 shows the throughput the path really achieves. Use that number in the calculator instead of the circuit's nominal speed.",
      },
    ],
    tips: [
      { title: "Bits vs bytes", text: "100 Mbps is only 12.5 MB per second. Download tools often show MB/s while ISPs advertise Mbps, so divide by 8 to compare." },
      { title: "Latency limits single streams", text: "Over long distances, one TCP connection may not fill a fast link. Tools that use parallel streams, such as `robocopy /MT` or several `rsync` jobs, can help." },
      { title: "Disks can be the bottleneck", text: "A 10 Gbps link can move about 1.25 GB/s, faster than many HDD arrays can read. Check storage throughput as well as the network." },
      { title: "Compression and deduplication change the maths", text: "Backup tools that compress or deduplicate send far fewer bytes than the raw data size. Estimate from the reduced size if you know it." },
    ],
    faq: [
      { q: "Why does my real transfer take longer than the estimate?", a: "The estimate assumes 100% link utilization. TCP/IP overhead, encryption, latency, packet loss, disk speed and competing traffic all reduce real throughput." },
      { q: "How many GB can I transfer per hour at 1 Gbps?", a: "Ideally about 450 GB per hour (1 Gbps ÷ 8 = 125 MB/s × 3,600 s). In practice, 350–400 GB per hour is typical." },
      { q: "Does this use 1000 or 1024 for units?", a: "Decimal (1000), which matches how network speeds and most drive capacities are advertised." },
      { q: "Should I use my upload or download speed?", a: "Use the speed of the slowest direction along the path. When sending data from an office, that is usually the upload speed." },
    ],
    related: [
      { href: "/network/internet-speed-test/", label: "Internet Speed Test" },
      { href: "/linux/rsync-command-generator/", label: "Rsync Command Generator" },
      { href: "/windows/robocopy-generator/", label: "Robocopy Generator" },
      { href: "/database/database-size-calculator/", label: "Database Size Calculator" },
    ],
  },

  "password-generator": {
    heading: "How to generate a strong password",
    intro: [
      "The strongest passwords are long and truly random, which humans are bad at producing. This generator uses your browser's cryptographically secure random number generator (`crypto.getRandomValues`) to pick each character, so the result is unpredictable and never leaves your device.",
      "You can choose a length from 8 to 128 characters and mix uppercase letters, lowercase letters, numbers and symbols. A 20-character password using all four sets has around 130 bits of entropy, far beyond what any brute-force attack can reach.",
    ],
    steps: [
      "Set the length. Use 16 or more for personal accounts and 24–32 for service accounts and API secrets.",
      "Tick the character sets the system allows. Some legacy apps reject certain symbols; untick Symbols if that happens.",
      "Click Generate. A new password appears each time.",
      "Click Copy and save it straight into your password manager or secrets vault.",
    ],
    examples: [
      {
        title: "Generating passwords on the command line",
        code: "# Linux / macOS\nopenssl rand -base64 24\n\n# PowerShell 7+\n-join ((33..126) | Get-Random -Count 24 | ForEach-Object {[char]$_})",
        text: "Useful in scripts. Note that the PowerShell example never repeats a character, which slightly reduces randomness. For secrets used in automation, `openssl rand` is the better choice.",
      },
      {
        title: "Choosing length for the job",
        text: "Admin account with MFA: 16+ characters. Database or service account: 32 characters with no symbols that need escaping in connection strings. Wi-Fi WPA2/WPA3 key: 20+ characters.",
      },
    ],
    tips: [
      { title: "Don't reuse passwords", text: "Generate a new one for every account. Reuse is how one breach turns into many compromised accounts." },
      { title: "Watch for symbols in connection strings", text: "Characters like `@`, `:`, `/`, `;` and `%` can break database URLs and shell commands unless escaped. Untick Symbols for passwords that go into config files." },
      { title: "Store it immediately", text: "Copy the password into a manager such as Bitwarden, 1Password, KeePass or your organization's vault before you close the page." },
      { title: "Rotate after exposure", text: "Change a password as soon as it appears in a log, ticket, chat message or source code." },
    ],
    faq: [
      { q: "Are the generated passwords stored or sent anywhere?", a: "No. They are generated in your browser and exist only on your screen until you copy them." },
      { q: "Is the randomness secure?", a: "Yes. The tool uses the Web Crypto `getRandomValues` API, the same secure source browsers use for encryption keys." },
      { q: "How long should a password be?", a: "16 characters is a good minimum for most accounts. Longer is always better, especially for accounts without MFA." },
      { q: "Is a passphrase better than a random password?", a: "A random passphrase of 5 or more words is excellent when you need to remember or type it. For passwords stored in a manager, random characters are simpler." },
    ],
    related: [
      { href: "/security/password-strength-checker/", label: "Password Strength Checker" },
      { href: "/security/hash-generator/", label: "Hash Generator" },
      { href: "/kubernetes/secret-generator/", label: "Kubernetes Secret Generator" },
      { href: "/devops/env-file-generator/", label: ".env File Generator" },
    ],
  },

  "internet-speed-test": {
    heading: "How this internet speed test works",
    intro: [
      "The test measures three things between your browser and Gokuruvi's server on Cloudflare's network. Latency is the average of four small ping requests, in milliseconds. Download speed comes from timing a 4 MB download, and upload speed from timing a 2 MB upload, both in Mbps.",
      "Because the test is small, it finishes in a few seconds and is gentle on metered connections. The trade-off is that on very fast connections (several hundred Mbps or more), a short transfer may not reach full speed, so results can read lower than your plan. It's best used as a quick health check rather than a certification of your line.",
    ],
    steps: [
      "Close downloads, video calls and cloud sync apps that could compete for bandwidth.",
      "If possible, test on a wired Ethernet connection to rule out Wi-Fi problems.",
      "Click Run speed test and wait for all three stages to complete.",
      "Run it two or three times and take the typical result, not the best one.",
    ],
    examples: [
      {
        title: "Reading your latency",
        text: "Under 30 ms is excellent for video calls and remote desktop. 30–100 ms is fine for most work. Over 150 ms, remote sessions feel sluggish. If latency jumps during a download, your router may suffer from bufferbloat.",
      },
      {
        title: "Checking the path when speed is poor",
        code: "# Windows\ntracert 1.1.1.1\npathping 1.1.1.1\n\n# Linux\nmtr -rwc 50 1.1.1.1",
        text: "These show where along the route latency or packet loss appears: inside your network, at your ISP, or further away.",
      },
    ],
    tips: [
      { title: "Wi-Fi is the usual suspect", text: "Distance, walls and 2.4 GHz congestion can halve your speed. Compare a wired result before you call your ISP." },
      { title: "VPNs reduce speed", text: "A corporate VPN routes traffic through its own gateway, which adds latency and caps throughput. Test with and without it." },
      { title: "Upload matters for remote work", text: "Video calls, cloud backups and file sharing depend on upload speed, which is often much lower than download on home connections." },
      { title: "Test at different times", text: "Evening slowdowns point to congestion at your ISP. Consistently low results point to your equipment or plan." },
    ],
    faq: [
      { q: "Why is my result lower than my ISP plan?", a: "Wi-Fi, other devices, VPNs and the short test size can all lower the figure. ISPs also advertise the maximum speed, not the guaranteed one." },
      { q: "What speed do I need to work from home?", a: "For one person, 25 Mbps down and 5–10 Mbps up with latency under 50 ms comfortably handles video calls, RDP and VPN." },
      { q: "Does the test use a lot of data?", a: "No. Each run transfers about 6 MB, so it's safe on mobile data." },
      { q: "What is jitter?", a: "Jitter is how much latency varies between packets. High jitter causes choppy voice and video even when average speed looks fine." },
    ],
    related: [
      { href: "/network/bandwidth-calculator/", label: "Bandwidth Calculator" },
      { href: "/network/what-is-my-ip/", label: "What Is My IP" },
      { href: "/network/dns-checker/", label: "DNS Checker" },
      { href: "/windows/tcp-port-tester/", label: "TCP Port Tester" },
    ],
  },

  "what-is-my-ip": {
    heading: "Understanding your public IP address",
    intro: [
      "Your public IP address is the address the internet sees when you connect to a website. It usually belongs to your router or your ISP's gateway, not to your laptop itself. Devices inside your home or office share it through NAT (network address translation).",
      "This page shows both your public IPv4 address and, if your connection supports it, your IPv6 address. They are detected by asking the ipify service from your browser. If a line says \"Not available on this network\", your connection doesn't route that protocol.",
      "Knowing your public IP is essential when you need to allowlist your office in a cloud firewall, configure a VPN, set up port forwarding or troubleshoot why a remote service rejects you.",
    ],
    steps: [
      "Open this page. The IPv4 and IPv6 lookups start automatically.",
      "Copy the address you need. Most firewall allowlists and security groups want IPv4.",
      "When adding it to a firewall rule, use `/32` for a single IPv4 address or `/128` for a single IPv6 address.",
      "Check again later if your ISP assigns dynamic addresses, because they can change after a router restart.",
    ],
    examples: [
      {
        title: "Getting your public IP from a terminal",
        code: "# Linux / macOS\ncurl -4 https://api.ipify.org; echo\ncurl -6 https://api6.ipify.org; echo\n\n# Windows PowerShell\n(Invoke-RestMethod https://api.ipify.org?format=json).ip",
        text: "Handy on servers without a browser, for example to confirm which address a cloud VM uses for outbound traffic.",
      },
      {
        title: "Allowing only your office in an AWS security group",
        code: "aws ec2 authorize-security-group-ingress --group-id sg-0123456789abcdef0 \\\n  --protocol tcp --port 22 --cidr 203.0.113.25/32",
        text: "Replace the example address with the IPv4 address shown above. Never open SSH or RDP to `0.0.0.0/0`.",
      },
    ],
    tips: [
      { title: "Public vs private IP", text: "`ipconfig` or `ip addr` shows your private address (such as 192.168.1.20). Websites only ever see the public one shown here." },
      { title: "VPNs change your public IP", text: "With a VPN connected, this page shows the VPN provider's exit address. Disconnect it if you need your real office address." },
      { title: "CGNAT", text: "Some ISPs share one public IPv4 address between many customers (carrier-grade NAT). In that case, port forwarding to your home network won't work over IPv4." },
      { title: "Static IPs cost extra", text: "Business connections can get a fixed IP, which is useful for allowlisting. Otherwise, dynamic DNS can track a changing address." },
    ],
    faq: [
      { q: "Can someone find my home address from my IP?", a: "No. An IP address usually shows only your ISP and a rough city or region. Precise location requires a legal request to the ISP." },
      { q: "Why do I have both IPv4 and IPv6?", a: "Many ISPs run both protocols (dual-stack). Websites that support IPv6 will usually be reached over it." },
      { q: "Why does my IP address keep changing?", a: "Most home connections get a dynamic address that the ISP can reassign, often after the router restarts." },
      { q: "Is my IP address stored?", a: "Gokuruvi doesn't store it. The lookup is sent from your browser directly to the ipify API." },
    ],
    related: [
      { href: "/network/ip-calculator/", label: "IP Calculator" },
      { href: "/network/abuseipdb-check/", label: "AbuseIPDB Check" },
      { href: "/network/dns-checker/", label: "DNS Checker" },
      { href: "/cloud/aws-security-group-generator/", label: "AWS Security Group Generator" },
    ],
  },
};
