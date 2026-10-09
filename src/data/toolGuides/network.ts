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
  "dns-checker": {
    heading: "How to check DNS records and troubleshoot DNS problems",
    intro: [
      "DNS turns names like `www.example.com` into IP addresses and tells the world where your email goes. Most website launches, email migrations and certificate renewals involve a DNS change, and most of the resulting \"it works for me but not for them\" problems are DNS problems.",
      "This checker queries Google Public DNS over HTTPS and shows every answer with its TTL (time to live, in seconds). It supports the record types you need most: A (IPv4), AAAA (IPv6), MX (mail servers), NS (authoritative name servers), TXT (SPF, DKIM, DMARC and domain verification), CNAME (aliases) and SOA (zone serial and timers). Because it checks from Google's public resolvers, it shows what the internet sees, not what your office DNS or hosts file says.",
    ],
    steps: [
      "Enter a domain or hostname, without `https://` or a path.",
      "Choose the record type.",
      "Click Check DNS and read the answers. Each line shows the name, the TTL and the value.",
      "Compare the result with what your DNS provider's control panel says it should be.",
    ],
    examples: [
      {
        title: "Checking email authentication records",
        code: "TXT  example.com          -> \"v=spf1 include:_spf.google.com ~all\"\nTXT  _dmarc.example.com   -> \"v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com\"\nTXT  google._domainkey.example.com -> \"v=DKIM1; k=rsa; p=MIIBIjANBg...\"\nMX   example.com          -> 1 smtp.google.com.",
        text: "If mail lands in spam or gets rejected, check these four first. There must be exactly one SPF record per domain.",
      },
      {
        title: "The same lookups from a terminal",
        code: "# Linux / macOS\ndig +short MX example.com\ndig @8.8.8.8 www.example.com A\n\n# Windows\nResolve-DnsName example.com -Type MX\nnslookup -type=TXT example.com 8.8.8.8",
        text: "Query a specific server with `@8.8.8.8` (dig) or by adding it at the end (nslookup) to compare public DNS with your internal DNS.",
      },
    ],
    tips: [
      { title: "Changes take up to the old TTL to spread", text: "Resolvers cache answers for the TTL of the old record. Lower the TTL to 300 seconds a day before a planned migration, then raise it again afterwards." },
      { title: "A CNAME can't share a name", text: "A name with a CNAME can't have any other records, which is why the bare domain (`example.com`) usually can't be a CNAME. Many DNS providers offer ALIAS or flattened CNAME records instead." },
      { title: "Check the authoritative servers", text: "If NS records point to an old provider, changes made at the new one are ignored. NS records are set at your domain registrar." },
      { title: "Split DNS", text: "Company networks often answer differently for internal names. If this tool and your laptop disagree, internal DNS or the hosts file is probably overriding public DNS." },
    ],
    faq: [
      { q: "Why do I see the old IP address after changing DNS?", a: "Resolvers and your computer cache the old answer until its TTL expires. Flush your local cache with `ipconfig /flushdns` (Windows) or wait for the TTL to pass." },
      { q: "What DNS server does this tool use?", a: "Google Public DNS (8.8.8.8), queried over HTTPS. That shows the public view of your records." },
      { q: "What is a TTL?", a: "Time to live: how many seconds a resolver may cache the answer before asking again." },
      { q: "How long does DNS propagation take?", a: "Usually minutes to a few hours, limited by the previous TTL. Changing name servers at the registrar can take up to 48 hours." },
    ],
    related: [
      { href: "/network/what-is-my-ip/", label: "What Is My IP" },
      { href: "/network/ssl-checker/", label: "SSL Certificate Checker" },
      { href: "/network/port-checker/", label: "Port Checker" },
      { href: "/windows/command-generator/", label: "Windows CMD Generator" },
    ],
  },
  "ip-calculator": {
    heading: "Reading an IPv4 address: types, ranges and conversions",
    intro: [
      "Every IPv4 address is a 32-bit number written as four decimal octets. This calculator shows what kind of address you have (private, public, loopback, link-local or multicast), its historical class and default mask, and the same value in binary, hexadecimal, octal, unsigned decimal and reverse-DNS form.",
      "Recognizing the address type at a glance saves a lot of troubleshooting time. A server with a `169.254.x.x` address didn't get DHCP, a `10.x` address will never be reachable from the internet without NAT, and a `127.x` address only ever talks to the machine itself.",
    ],
    steps: [
      "Enter an IPv4 address, or click a preset such as Private or Link-local to see an example.",
      "Click Calculate IP.",
      "Read the type and class, then the octet table showing each part in binary, hex and octal.",
      "Use Copy Result to paste the full breakdown into a ticket or documentation.",
    ],
    examples: [
      {
        title: "The address ranges worth memorizing",
        code: "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16   private (RFC 1918)\n100.64.0.0/10                               carrier-grade NAT (shared)\n127.0.0.0/8                                 loopback\n169.254.0.0/16                              link-local (no DHCP answer)\n224.0.0.0/4                                 multicast",
        text: "Anything outside these (and a few other reserved blocks) is a public address that's routed on the internet.",
      },
      {
        title: "Why reverse DNS uses in-addr.arpa",
        code: "dig -x 8.8.8.8 +short\n# dns.google.\n# (queries 8.8.8.8.in-addr.arpa, the octets reversed)",
        text: "The calculator shows the in-addr.arpa name for any address. Mail servers check reverse DNS, so outbound mail from an address without a PTR record is often rejected.",
      },
    ],
    tips: [
      { title: "172.16/12 isn't all of 172.x", text: "Only 172.16.0.0 to 172.31.255.255 is private. An address like 172.32.0.5 is public, a common mix-up in firewall rules." },
      { title: "Classes are history", text: "Class A/B/C boundaries haven't controlled routing since CIDR arrived in 1993. Use the prefix length (/24, /20…) when designing networks." },
      { title: "169.254 means DHCP failed", text: "If a server shows a 169.254.x.x address, it couldn't reach a DHCP server. Check the cable, VLAN or port-group, and the DHCP scope." },
      { title: "Leading zeros can mislead", text: "Some tools read `010.001.001.001` as octal (8.1.1.1). Always write octets without leading zeros." },
    ],
    faq: [
      { q: "How do I know if an IP is private or public?", a: "Private addresses are in 10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16. The calculator tells you the type directly." },
      { q: "What is a loopback address?", a: "Any address in 127.0.0.0/8, usually 127.0.0.1. Traffic sent to it never leaves the machine." },
      { q: "Why convert an IP to decimal or hex?", a: "Some logs, databases and network devices store addresses as a single number, and hex appears in packet captures and kernel output." },
      { q: "Does this support IPv6?", a: "This calculator is for IPv4. To see your own IPv6 address, use What Is My IP." },
    ],
    related: [
      { href: "/network/subnet-calculator/", label: "Subnet Calculator" },
      { href: "/network/cidr-calculator/", label: "CIDR Calculator" },
      { href: "/network/what-is-my-ip/", label: "What Is My IP" },
      { href: "/guides/networking-fundamentals/", label: "Networking Fundamentals Guide" },
    ],
  },

  "subnet-calculator": {
    heading: "Planning subnets: worked examples and common mistakes",
    intro: [
      "A subnet calculator answers the questions you need before configuring any interface, VLAN or cloud network: what's the network address, the broadcast address, the usable host range, and how many hosts fit. Enter an address and a prefix, and the calculator shows all of these, plus the mask in binary, and handles the special cases of /31 point-to-point links and /32 single-host routes.",
      "Below is how to size subnets for real use, and the mistakes that cause overlapping networks and unreachable hosts.",
    ],
    steps: [
      "Enter any IPv4 address in the network, for example `192.168.10.57`.",
      "Choose the CIDR prefix, or click a preset.",
      "Click Calculate Subnet and read the network, broadcast, first and last host, and host count.",
      "Use Copy Result to record the plan, then configure the gateway (often the first host) and DHCP range.",
    ],
    examples: [
      {
        title: "How many hosts does each prefix give?",
        code: "/24  255.255.255.0     254 usable hosts\n/25  255.255.255.128   126\n/26  255.255.255.192    62\n/27  255.255.255.224    30\n/28  255.255.255.240    14\n/29  255.255.255.248     6\n/30  255.255.255.252     2\n/31  point-to-point link (2 addresses, both usable)",
        text: "Usable hosts = 2^(32 − prefix) − 2, because the network and broadcast addresses can't be assigned (except on /31 and /32).",
      },
      {
        title: "Splitting a /24 for three VLANs",
        code: "192.168.10.0/25     servers   (126 hosts)\n192.168.10.128/26   users     (62 hosts)\n192.168.10.192/27   printers  (30 hosts)\n192.168.10.224/27   spare",
        text: "Allocate the largest subnets first, so each one starts on a boundary that matches its size, and leave room to grow.",
      },
    ],
    tips: [
      { title: "Check for overlaps", text: "Two subnets that overlap (for example 10.0.0.0/16 and 10.0.5.0/24) cause routing confusion that's hard to diagnose. Plan an address map before creating networks, especially across VPNs and cloud VPCs." },
      { title: "Cloud providers reserve more", text: "AWS reserves 5 addresses in every subnet and Azure also reserves 5, so a /28 gives 11 usable addresses there, not 14." },
      { title: "Wrong mask, partial reachability", text: "A host configured with /16 when the network is /24 can reach its neighbors but sends some traffic to the wrong place. Mask mismatches are a classic \"some things work\" fault." },
      { title: "Don't use the network or broadcast address", text: "Assigning the .0 or .255 of a /24 to a host causes intermittent failures on many systems." },
    ],
    faq: [
      { q: "What's the difference between a subnet mask and a prefix?", a: "They express the same thing. /24 is shorthand for 255.255.255.0: the first 24 bits are the network part." },
      { q: "How many IPs are in a /22?", a: "1,024 addresses, 1,022 usable. Each step down in prefix doubles the size." },
      { q: "What is a /31 used for?", a: "Router-to-router point-to-point links. RFC 3021 lets both addresses be used, saving addresses compared with a /30." },
      { q: "Which address should be the gateway?", a: "Any usable address works, but the first (for example .1) is the common convention. Pick one and use it consistently." },
    ],
    related: [
      { href: "/network/cidr-calculator/", label: "CIDR Calculator" },
      { href: "/network/ip-calculator/", label: "IP Calculator" },
      { href: "/cloud/aws-security-group-generator/", label: "AWS Security Group Generator" },
      { href: "/guides/networking-fundamentals/", label: "Networking Fundamentals Guide" },
    ],
  },

  "cidr-calculator": {
    heading: "CIDR notation for firewall rules, cloud networks and routing",
    intro: [
      "CIDR notation (`10.20.0.0/16`) is how you describe address ranges in firewall rules, cloud security groups, VPC and VNet designs, Kubernetes network policies and route tables. This calculator takes an address and prefix and shows the network address, broadcast, host range and total addresses, with the binary breakdown, so you can confirm a range covers exactly what you intend.",
      "Below are the ways CIDR shows up in day-to-day work, and how to avoid ranges that are too wide or that overlap.",
    ],
    steps: [
      "Enter an IPv4 address and choose the prefix, or click a common prefix like /24 or /32.",
      "Click Calculate CIDR.",
      "Check the network address. If it's not the address you typed, your rule needs the network address, not the host address.",
      "Copy the result, and use the `network/prefix` form in your firewall or cloud configuration.",
    ],
    examples: [
      {
        title: "Writing precise firewall rules",
        code: "203.0.113.25/32      one office IP\n203.0.113.0/28       a block of 16 addresses (your ISP allocation)\n10.20.0.0/16         an entire VPC\n0.0.0.0/0            everything (avoid for SSH, RDP and databases)",
        text: "Use /32 for single addresses. The wider the range, the more of the internet can reach the service.",
      },
      {
        title: "Designing non-overlapping VPCs",
        code: "10.10.0.0/16   production VPC\n10.20.0.0/16   staging VPC\n10.30.0.0/16   shared services\n10.40.0.0/14   reserved for future regions",
        text: "VPC peering, VPNs and Transit Gateways don't work between overlapping ranges, and renumbering later is painful. Reserve ranges per environment up front.",
      },
    ],
    tips: [
      { title: "A host address with a prefix is a common error", text: "`192.168.1.50/24` in a route or rule usually means `192.168.1.0/24`. Some systems reject it and others silently convert it." },
      { title: "Kubernetes needs its own ranges", text: "Pod and Service CIDRs in Kubernetes must not overlap your node network or any network the cluster must reach, including on-premises ranges over VPN." },
      { title: "Avoid 172.17.0.0/16 on Docker hosts", text: "Docker's default bridge uses it. Corporate networks in that range can become unreachable from Docker hosts." },
      { title: "Summarize to keep rule sets small", text: "Four /24s from 10.1.0.0 to 10.1.3.0 can be written as one 10.1.0.0/22, making rules shorter and easier to audit." },
    ],
    faq: [
      { q: "What does /32 mean?", a: "A single address: all 32 bits are fixed. It's the standard way to allow one specific IP." },
      { q: "What does 0.0.0.0/0 mean?", a: "Every IPv4 address. In security rules it means \"anyone on the internet\"." },
      { q: "How do I combine several ranges into one CIDR?", a: "They must be contiguous and aligned to a power-of-two boundary. 10.0.0.0/24 and 10.0.1.0/24 combine into 10.0.0.0/23; 10.0.1.0/24 and 10.0.2.0/24 don't." },
      { q: "What's the difference between this and the subnet calculator?", a: "They do the same maths. This one is aimed at range notation for rules and network design; the subnet calculator focuses on host planning." },
    ],
    related: [
      { href: "/network/subnet-calculator/", label: "Subnet Calculator" },
      { href: "/cloud/aws-security-group-generator/", label: "AWS Security Group Generator" },
      { href: "/cloud/azure-nsg-generator/", label: "Azure NSG Generator" },
      { href: "/linux/firewall-cmd-generator/", label: "firewall-cmd Generator" },
    ],
  },

  "port-checker": {
    heading: "Testing whether a port is open from the internet",
    intro: [
      "This checker makes a real TCP connection to the host and port you enter, from Gokuruvi's server on Cloudflare's network, and reports whether the connection was accepted and how long it took. Because the test runs from the internet, it shows what the outside world can reach, which is exactly what you need when checking a new firewall rule, port forward or cloud security group.",
      "It tests TCP only, and works with public hostnames and IP addresses. Private addresses like 192.168.x.x can't be tested from the internet; use the Windows TCP Port Tester or `nc` from inside your network instead.",
    ],
    steps: [
      "Enter a public hostname or IP address.",
      "Choose a common port from the list, click a quick button (SSH, HTTP, HTTPS, RDP), or type any port.",
      "Click Check Port.",
      "Read the status and response time, then use Copy Result to save the evidence.",
    ],
    examples: [
      {
        title: "Open, closed or filtered: what each result means",
        code: "Open       the host accepted the TCP handshake: a service is listening and nothing blocked it\nClosed     the host or a firewall actively refused the connection\nNo answer  packets were silently dropped (a filtering firewall), or the host is down",
        text: "A quick \"closed\" usually means nothing is listening on that port. A slow failure usually means a firewall or security group is dropping the traffic.",
      },
      {
        title: "Checking the same thing from your own network",
        code: "# Linux / macOS\nnc -zv mail.example.com 587\n\n# Windows PowerShell\nTest-NetConnection mail.example.com -Port 587",
        text: "If the port is open from your office but closed from the internet, the problem is an edge firewall, NAT rule or cloud security group.",
      },
    ],
    tips: [
      { title: "Check every layer", text: "For a port to be open from the internet, the service must listen on the right interface, the host firewall must allow it, and the network firewall, NAT or cloud security group must forward it." },
      { title: "Listening on 127.0.0.1 only", text: "A service bound to localhost is invisible from outside. `ss -lntp` shows the bind address; it should be `0.0.0.0` or the public interface." },
      { title: "Don't leave risky ports open", text: "SSH (22), RDP (3389), databases (3306, 5432, 1433), Docker (2375) and Elasticsearch (9200) should never be open to the whole internet. Restrict them to known IPs or a VPN." },
      { title: "UDP needs other tools", text: "This tool tests TCP. UDP services such as DNS, NTP or VPNs need application-level tests." },
    ],
    faq: [
      { q: "Can I check a private IP like 192.168.1.10?", a: "No. Private addresses aren't reachable from the internet. Test them from a machine inside the same network." },
      { q: "Why does the port show closed when the service is running?", a: "Usually a host firewall, cloud security group or missing port-forward, or the service is listening only on localhost." },
      { q: "Is port checking legal?", a: "Checking your own servers is normal administration. Only scan systems you own or are authorized to test." },
      { q: "Why is my home server's port closed even with port forwarding?", a: "Your ISP may use carrier-grade NAT, so your router doesn't have a public IPv4 address, or it may block common ports such as 25 and 80." },
    ],
    related: [
      { href: "/windows/tcp-port-tester/", label: "Windows TCP Port Tester" },
      { href: "/network/what-is-my-ip/", label: "What Is My IP" },
      { href: "/database/database-port-reference/", label: "Database Port Reference" },
      { href: "/vmware/port-reference/", label: "VMware Port Reference" },
    ],
  },

  "ssl-checker": {
    heading: "Reading an SSL/TLS report and fixing common problems",
    intro: [
      "This checker runs a full assessment of a public website's HTTPS setup using the Qualys SSL Labs service. It shows the overall grade, certificate details (issuer, validity dates, days remaining, names covered, key type and size), the TLS protocol versions the server accepts, and security checks for known weaknesses. A fresh assessment takes a minute or two; cached results return faster.",
      "Below is how to read the report and fix the problems that come up most often: expiring certificates, missing intermediate certificates, name mismatches and old protocols.",
    ],
    steps: [
      "Enter the hostname only (for example `www.example.com`), without `https://` or a path.",
      "Tick \"Request a fresh SSL assessment\" if you've just changed the certificate or server settings.",
      "Click Check SSL and wait for the progress bar to finish.",
      "Review the grade, days remaining, hostnames and protocols, and copy the result for your records.",
    ],
    examples: [
      {
        title: "Checking a certificate from the command line",
        code: "echo | openssl s_client -connect www.example.com:443 -servername www.example.com 2>/dev/null \\\n  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName",
        text: "Shows the same subject, issuer, expiry dates and covered names. `-servername` is required on servers that host several sites (SNI).",
      },
      {
        title: "Finding a missing intermediate certificate",
        code: "openssl s_client -connect www.example.com:443 -servername www.example.com -showcerts </dev/null | grep -E 's:|i:'",
        text: "A working chain lists your certificate and at least one intermediate. If only one certificate appears, install the full chain file from your certificate provider. Browsers may hide this problem, but apps and APIs fail.",
      },
    ],
    tips: [
      { title: "Automate renewals", text: "Expired certificates are the most common HTTPS outage. Use automatic renewal (Let's Encrypt with certbot, or your cloud provider's managed certificates), and alert at 30 days remaining." },
      { title: "Names must match exactly", text: "A certificate for `example.com` doesn't cover `www.example.com` unless both are listed. A wildcard `*.example.com` covers one level only." },
      { title: "Disable TLS 1.0 and 1.1", text: "Modern browsers have dropped them. Support TLS 1.2 and 1.3 only." },
      { title: "Add HSTS once HTTPS is solid", text: "The Strict-Transport-Security header stops browsers from ever using plain HTTP. See the Security Headers Analyzer before enabling it." },
    ],
    faq: [
      { q: "Why does the check take so long?", a: "SSL Labs runs dozens of tests against every server behind the hostname. Untick the fresh assessment option to get a recent cached result faster." },
      { q: "What grade should I aim for?", a: "A or A+. Anything below A usually means old protocols, weak ciphers or chain problems that the report lists." },
      { q: "Can I check an internal server?", a: "No. SSL Labs only tests publicly reachable hosts on port 443. Use the openssl commands above for internal servers." },
      { q: "My site works in the browser but an app says the certificate is untrusted. Why?", a: "Usually a missing intermediate certificate. Browsers can fetch it themselves; most apps and command-line tools can't." },
    ],
    related: [
      { href: "/security/security-headers-analyzer/", label: "Security Headers Analyzer" },
      { href: "/linux/openssl-command-generator/", label: "OpenSSL Command Generator" },
      { href: "/network/dns-checker/", label: "DNS Checker" },
      { href: "/security/csp-generator/", label: "CSP Generator" },
    ],
  },
};
