import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { Banner } from "fumadocs-ui/components/banner";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { Suspense, use } from "react";
import { useMDXComponents } from "@/components/mdx";
import { baseOptions } from "@/lib/layout.shared";
import { appName, docsRoute, siteUrl } from "@/lib/shared";
import { docs, source } from "@/lib/source";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await loader({ data: slugs });
    await docs.getPage(data.path)?.preload();
    return data;
  },
  head: ({ loaderData }) => {
    /* Pages of both versions share titles like "Overview", so the tab title
       names the world the page belongs to. */
    const world = loaderData?.url.startsWith(`${docsRoute}/v2`)
      ? `${appName} v2`
      : appName;
    return {
      meta: [
        { title: loaderData ? `${loaderData.title} | ${world}` : appName },
        ...(loaderData?.description
          ? [{ name: "description", content: loaderData.description }]
          : []),
      ],
      links: loaderData
        ? [{ rel: "canonical", href: `${siteUrl}${loaderData.url}` }]
        : [],
    };
  },
});

const loader = createServerFn({
  method: "GET",
})
  .validator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      url: page.url,
      title: page.data.title ?? appName,
      description: page.data.description,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

function Content({ path }: { path: string }) {
  const page = docs.getPage(path);
  if (!page) throw new Error(`unknown page: ${path}`);

  const { toc } = use(page.load());
  const MDX = page.body;

  return (
    <DocsPage toc={toc}>
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <DocsBody>
        <MDX components={useMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

function Page() {
  const data = Route.useLoaderData();
  const { pageTree, path } = useFumadocsLoader(data);

  return (
    <>
      {data.url.startsWith(`${docsRoute}/v2`) && (
        <Banner id="v3-released">
          v3 is out.&nbsp;
          <Link
            to="/docs/$"
            params={{ _splat: "migration" }}
            className="underline"
          >
            The migration guide
          </Link>
          &nbsp;maps every v2 surface onto it.
        </Banner>
      )}
      <DocsLayout {...baseOptions()} tree={pageTree}>
        <Suspense>
          <Content path={path} />
        </Suspense>
      </DocsLayout>
    </>
  );
}
