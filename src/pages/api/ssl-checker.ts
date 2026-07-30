import type { APIRoute } from "astro";

export const prerender = false;

const SSL_LABS_API =
  "https://api.ssllabs.com/api/v3/analyze";

function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeHostname(value: string): string {
  let hostname = value.trim().toLowerCase();

  try {
    if (
      hostname.startsWith("http://") ||
      hostname.startsWith("https://")
    ) {
      hostname = new URL(hostname).hostname;
    }
  } catch {
    return "";
  }

  return hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");
}

function isValidHostname(hostname: string): boolean {
  if (
    !hostname ||
    hostname.length > 253 ||
    hostname.includes("/") ||
    hostname.includes("\\") ||
    hostname.includes("@") ||
    hostname.includes(":") ||
    /\s/.test(hostname)
  ) {
    return false;
  }

  const labels = hostname.split(".");

  if (labels.length < 2) {
    return false;
  }

  return labels.every((label) => {
    return (
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-z0-9-]+$/i.test(label) &&
      !label.startsWith("-") &&
      !label.endsWith("-")
    );
  });
}

function formatDate(
  timestamp: unknown,
): string | null {
  const value = Number(timestamp);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function calculateDaysRemaining(
  expiryDate: string | null,
): number | null {
  if (!expiryDate) {
    return null;
  }

  const expiryTime = new Date(expiryDate).getTime();

  if (Number.isNaN(expiryTime)) {
    return null;
  }

  return Math.ceil(
    (expiryTime - Date.now()) / 86_400_000,
  );
}

function summarizeEndpoint(endpoint: any) {
  const details = endpoint?.details ?? {};
  const certificate = details?.cert ?? {};

  const validFrom = formatDate(
    certificate?.notBefore,
  );

  const validUntil = formatDate(
    certificate?.notAfter,
  );

  const daysRemaining =
    calculateDaysRemaining(validUntil);

  const protocols = Array.isArray(
    details?.protocols,
  )
    ? details.protocols.map((protocol: any) => ({
        name: String(protocol?.name ?? ""),
        version: String(protocol?.version ?? ""),
      }))
    : [];

  return {
    ipAddress: String(
      endpoint?.ipAddress ?? "Not available",
    ),

    serverName: String(
      endpoint?.serverName ?? "",
    ),

    statusMessage: String(
      endpoint?.statusMessage ?? "Not available",
    ),

    grade: String(endpoint?.grade ?? "—"),

    hasWarnings: Boolean(endpoint?.hasWarnings),

    certificate: {
      subject: String(
        certificate?.subject ?? "Not available",
      ),

      issuerSubject: String(
        certificate?.issuerSubject ??
          "Not available",
      ),

      commonNames: Array.isArray(
        certificate?.commonNames,
      )
        ? certificate.commonNames.map(String)
        : [],

      alternativeNames: Array.isArray(
        certificate?.altNames,
      )
        ? certificate.altNames.map(String)
        : [],

      signatureAlgorithm: String(
        certificate?.sigAlg ?? "Not available",
      ),

      keyAlgorithm: String(
        certificate?.keyAlg ?? "Not available",
      ),

      keySize:
        typeof certificate?.keySize === "number"
          ? certificate.keySize
          : null,

      serialNumber: String(
        certificate?.serialNumber ??
          "Not available",
      ),

      validFrom,
      validUntil,
      daysRemaining,

      expired:
        typeof daysRemaining === "number"
          ? daysRemaining < 0
          : null,

      selfSigned: Boolean(
        certificate?.selfSigned,
      ),
    },

    server: {
      serverSignature: String(
        details?.serverSignature ??
          "Not available",
      ),

      supportsRc4: Boolean(
        details?.supportsRc4,
      ),

      supportsAead: Boolean(
        details?.supportsAead,
      ),

      heartbeat: Boolean(details?.heartbeat),

      heartbleed: Boolean(
        details?.heartbleed,
      ),

      poodle: Boolean(details?.poodle),

      fallbackScsv: Boolean(
        details?.fallbackScsv,
      ),
    },

    protocols,
  };
}

export const GET: APIRoute = async () => {
  return jsonResponse({
    success: true,
    message: "SSL checker API is running.",
    timestamp: new Date().toISOString(),
  });
};

export const POST: APIRoute = async ({
  request,
}) => {
  try {
    let requestBody: {
      hostname?: unknown;
      startNew?: unknown;
    };

    try {
      requestBody = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          error: "Invalid request data.",
        },
        400,
      );
    }

    const hostname = normalizeHostname(
      String(requestBody.hostname ?? ""),
    );

    const startNew =
      requestBody.startNew === true;

    if (!isValidHostname(hostname)) {
      return jsonResponse(
        {
          success: false,
          error:
            "Enter a valid public hostname such as example.com.",
        },
        400,
      );
    }

    const parameters = new URLSearchParams({
      host: hostname,
      publish: "off",
      all: "done",
      ignoreMismatch: "on",
    });

    if (startNew) {
      parameters.set("startNew", "on");
    } else {
      parameters.set("fromCache", "on");
      parameters.set("maxAge", "24");
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 20_000);

    let upstreamResponse: Response;

    try {
      upstreamResponse = await fetch(
        `${SSL_LABS_API}?${parameters.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent":
              "Gokuruvi-Tools-SSL-Checker/1.0",
          },
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    const responseText =
      await upstreamResponse.text();

    let sslLabsData: any;

    try {
      sslLabsData = JSON.parse(responseText);
    } catch {
      console.error(
        "SSL Labs returned non-JSON data:",
        responseText.slice(0, 1000),
      );

      return jsonResponse(
        {
          success: false,
          error:
            "The SSL assessment provider returned an invalid response.",
        },
        502,
      );
    }

    if (upstreamResponse.status === 429) {
      return jsonResponse(
        {
          success: false,
          error:
            "The SSL assessment service is busy. Please try again later.",
        },
        429,
      );
    }

    if (!upstreamResponse.ok) {
      return jsonResponse(
        {
          success: false,
          error:
            sslLabsData?.message ||
            "The SSL assessment service returned an error.",
        },
        502,
      );
    }

    if (sslLabsData?.status === "ERROR") {
      return jsonResponse(
        {
          success: false,
          status: "ERROR",
          error:
            sslLabsData?.statusMessage ||
            "The SSL assessment failed.",
        },
        422,
      );
    }

    if (
      sslLabsData?.status === "DNS" ||
      sslLabsData?.status === "IN_PROGRESS"
    ) {
      return jsonResponse({
        success: true,
        ready: false,
        host: hostname,
        status: sslLabsData.status,
        statusMessage:
          sslLabsData.statusMessage ||
          "Assessment in progress",

        endpoints: Array.isArray(
          sslLabsData.endpoints,
        )
          ? sslLabsData.endpoints.map(
              (endpoint: any) => ({
                ipAddress:
                  endpoint?.ipAddress ??
                  "Not available",

                statusMessage:
                  endpoint?.statusMessage ??
                  "Assessment in progress",

                progress:
                  typeof endpoint?.progress ===
                  "number"
                    ? endpoint.progress
                    : null,
              }),
            )
          : [],
      });
    }

    if (sslLabsData?.status !== "READY") {
      return jsonResponse({
        success: true,
        ready: false,
        host: hostname,
        status:
          sslLabsData?.status ?? "UNKNOWN",
        statusMessage:
          sslLabsData?.statusMessage ??
          "Waiting for assessment results",
      });
    }

    const endpoints = Array.isArray(
      sslLabsData?.endpoints,
    )
      ? sslLabsData.endpoints.map(
          summarizeEndpoint,
        )
      : [];

    return jsonResponse({
      success: true,
      ready: true,
      host: hostname,
      status: "READY",

      testTime: formatDate(
        sslLabsData?.testTime,
      ),

      engineVersion:
        sslLabsData?.engineVersion ??
        "Not available",

      criteriaVersion:
        sslLabsData?.criteriaVersion ??
        "Not available",

      endpoints,
    });
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      error.name === "AbortError";

    console.error("SSL checker API error:", error);

    return jsonResponse(
      {
        success: false,
        error: timedOut
          ? "The SSL assessment request timed out."
          : "An unexpected SSL checker error occurred.",
      },
      timedOut ? 504 : 500,
    );
  }
};