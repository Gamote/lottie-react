import { createFileRoute, Link } from "@tanstack/react-router";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock.core";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { LottieDisplay, useLottie } from "lottie-react";
import { codeThemes, getHighlighter } from "@/components/highlighter";
import { baseOptions } from "@/lib/layout.shared";
import { siteUrl } from "@/lib/shared";

const sample = `import { Lottie } from "lottie-react";

export function Hero() {
  return <Lottie src="/hero.json" autoplay loop />;
}`;

/* Measurements, not promises: re-measure when the build changes. The method:
   an entry importing the one symbol, bundled with react and lottie-web
   external, minified, gzipped. */
const claims = [
  {
    title: "Renders on the server",
    body: "Import it anywhere React runs. No dynamic import, no client-only workaround.",
  },
  {
    title: "About 4.4 KB",
    body: "Lottie alone, gzipped. Tree-shakeable, one file per module: an import pays only for what it reaches.",
  },
  {
    title: "Your styles win",
    body: "Every default ships at zero specificity. Restyle with a plain class, no !important.",
  },
  {
    title: "Plain Lottie files",
    body: "An imported object, a served path, or a URL. Exported anywhere, played as is.",
  },
];

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      {
        name: "description",
        content:
          "Lottie animations in React: one component for the easy path, the whole engine when you need control.",
      },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/` }],
  }),
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <LogoAnimation />
        <div className="flex flex-col gap-3">
          <h1 className="font-semibold text-3xl">
            Lottie animations for React
          </h1>
          <p className="text-fd-muted-foreground">
            One component plays a Lottie file. The hook, the instance and the
            whole engine underneath are yours when you want them.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/docs/$"
            params={{ _splat: "get-started/installation" }}
            className="rounded-lg bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground text-sm"
          >
            Install
          </Link>
          <Link
            to="/docs/$"
            params={{ _splat: "examples/basics" }}
            className="rounded-lg border px-4 py-2 font-medium text-sm"
          >
            Examples
          </Link>
        </div>
        <div className="w-full max-w-xl text-left">
          <DynamicCodeBlock
            lang="tsx"
            code={sample}
            highlighter={getHighlighter}
            options={codeThemes}
          />
        </div>
        <div className="grid w-full gap-4 text-left sm:grid-cols-2">
          {claims.map((claim) => (
            <div key={claim.title} className="rounded-lg border p-4">
              <p className="font-medium text-sm">{claim.title}</p>
              <p className="mt-1 text-fd-muted-foreground text-sm">
                {claim.body}
              </p>
            </div>
          ))}
        </div>
        <p className="text-fd-muted-foreground text-sm">
          Coming from v2?{" "}
          <Link
            to="/docs/$"
            params={{ _splat: "migration" }}
            className="underline"
          >
            The migration guide
          </Link>{" "}
          maps every v2 surface onto v3.
        </p>
      </div>
    </HomeLayout>
  );
}

/*
 * The library, used the way anybody else would use it. `size-40` is the whole
 * sizing story: the library's own width and height are zero-specificity
 * defaults in the `lottie-react` cascade layer, and the site's stylesheet
 * declares that layer first, so an ordinary utility class beats them.
 */
function LogoAnimation() {
  const lottie = useLottie({ src: "/anim.json", autoplay: true, loop: true });

  return <LottieDisplay lottie={lottie} className="size-40" />;
}
