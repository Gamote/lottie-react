import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";

/*
 * GitHub Pages serves the file 404.html for unknown paths. The prerender only
 * writes pages it fetched successfully and treats a 404 response as a failed
 * build, so the not-found UI gets a real route at /404, rendered at 200, and
 * the prepare script copies its output to 404.html.
 */
export const Route = createFileRoute("/404")({
  component: NotFound,
});
