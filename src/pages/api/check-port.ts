import type { APIRoute } from "astro";
import { connect } from "cloudflare:sockets";

export const prerender = false;

const SERVICE_NAMES: Record<number, string> = {
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  53: "DNS",
  80: "HTTP",
  110: "POP3",
  143: "IMAP",
  443: "HTTPS",
  465: "SMTPS",
  587: "SMTP Submission",
  993: "IMAPS",
  995: "POP3S",
  2049: "NFS",
  2375: "Docker",
  3000: "Application",
  3389: "RDP",
  5672: "RabbitMQ",
  6443: "Kubernetes API",
  8080: "HTTP Alternate",
  8443: "HTTPS Alternate",
  9200: "Elasticsearch",
};

const IPV4_PATTERN =
  /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function isValidHost(host: string): boolean {
  if (!host || host.length > 253) return false;
  if (/[:/?#@]/.test(host)) return false;
  return IPV4_PATTERN.test(host) || HOSTNAME_PATTERN.test(host);
}

function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b, c] = parts;
  if (a === 0) return true; // "this" network
  if (a === 10) return true; // 10.0.0.0/8 private
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 192 && b === 0 && c === 0) return true; // IETF protocol assignments
  if (a === 192 && b === 0 && c === 2) return true; // TEST-NET-1
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a === 198 && b === 51 && c === 100) return true; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return true; // TEST-NET-3
  if (a >= 224) return true; // multicast (224-239) and reserved (240-255)
  return false;
}

async function resolveHostToIPv4(host: string): Promise<string | null> {
  if (IPV4_PATTERN.test(host)) return host;

  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`,
      { headers: { accept: "application/dns-json" } },
    );
    if (!response.ok) return null;

    const data = (await response.json()) as {
      Answer?: Array<{ type: number; data: string }>;
    };
    const answer = data.Answer?.find((record) => record.type === 1);
    return answer?.data ?? null;
  } catch {
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as { host?: string; port?: number };
    const host = (body.host || "").trim().toLowerCase().replace(/\.$/, "");
    const port = Number(body.port);

    if (!isValidHost(host)) {
      return jsonResponse(
        { error: "Enter a valid public hostname or IPv4 address without http://, paths, or a port number." },
        400,
      );
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return jsonResponse({ error: "Select a valid TCP port." }, 400);
    }

    const resolvedIp = await resolveHostToIPv4(host);

    if (!resolvedIp || isPrivateOrReservedIPv4(resolvedIp)) {
      return jsonResponse(
        {
          error:
            "This destination could not be verified as a public host, or it resolves to a private, loopback, local, or reserved address.",
        },
        400,
      );
    }

    const startedAt = Date.now();
    let open = false;

    try {
      const socket = connect({ hostname: resolvedIp, port });
      await Promise.race([
        socket.opened,
        new Promise((_resolve, reject) =>
          setTimeout(() => reject(new Error("timeout")), 5000),
        ),
      ]);
      open = true;
      socket.close().catch(() => {});
    } catch {
      open = false;
    }

    return jsonResponse({
      host,
      port,
      service: SERVICE_NAMES[port] ?? "Unknown",
      open,
      responseTimeMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return jsonResponse({ error: "Unable to complete the port check." }, 500);
  }
};
