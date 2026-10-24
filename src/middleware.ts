import { defineMiddleware } from "astro:middleware";

// Browser security headers for every server-rendered response.
// - No script restrictions in the CSP: AdSense and Google Fonts load from many
//   Google domains, so only the safe directives are set here.
// - HSTS without includeSubDomains: mail.* and other email subdomains are
//   served by the old host and must keep working over plain connections.
// - COOP allows popups so ad clicks that open a new tab still work.
const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000",
  "Content-Security-Policy": "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), usb=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
};

function withSecurityHeaders(response: Response): Response {
  try {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      if (!response.headers.has(name)) response.headers.set(name, value);
    }
    return response;
  } catch {
    // Some responses have immutable headers; copy into a new response instead.
    const copy = new Response(response.body, response);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      if (!copy.headers.has(name)) copy.headers.set(name, value);
    }
    return copy;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const method = context.request.method;
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);

  // Every page lives at a trailing-slash URL (the form used in the sitemap and
  // canonical tags). Permanently redirect "/about" to "/about/" so search engines
  // see one URL per page. Files (anything with an extension), API routes and
  // Astro internals are left alone.
  if (
    (method === "GET" || method === "HEAD") &&
    !pathname.endsWith("/") &&
    !lastSegment.includes(".") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_")
  ) {
    return withSecurityHeaders(context.redirect(`${pathname}/${search}`, 301));
  }

  return withSecurityHeaders(await next());
});
