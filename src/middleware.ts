import { defineMiddleware } from "astro:middleware";

// Every page lives at a trailing-slash URL (the form used in the sitemap and
// canonical tags). Permanently redirect "/about" to "/about/" so search engines
// see one URL per page. Files (anything with an extension), API routes and
// Astro internals are left alone.
export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;
  const method = context.request.method;
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);

  if (
    (method === "GET" || method === "HEAD") &&
    !pathname.endsWith("/") &&
    !lastSegment.includes(".") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_")
  ) {
    return context.redirect(`${pathname}/${search}`, 301);
  }

  return next();
});
