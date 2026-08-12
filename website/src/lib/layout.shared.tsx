import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, docsRoute, gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img src="/lottie-logo.svg" alt="" className="size-5" />
          {appName}
        </>
      ),
    },
    links: [
      { text: "Docs", url: docsRoute, active: "nested-url", on: "nav" },
      { text: "Examples", url: `${docsRoute}/examples/basics`, on: "nav" },
      { text: "Reference", url: `${docsRoute}/reference/lottie`, on: "nav" },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
