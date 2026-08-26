import type { APIRoute } from "astro";
import { tools } from "../data/tools";

// Serves the same tool index used to build the category and popular-tools
// sections as static JSON, so the homepage's client-side search doesn't
// need to duplicate the data or ship it inline on every page load.
export const prerender = true;

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(tools), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600",
    },
  });
};
