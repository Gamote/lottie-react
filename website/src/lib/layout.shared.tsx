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
      { text: "Docs", url: docsRoute, active: "nested-url" },
      { text: "Examples", url: `${docsRoute}/examples/basics` },
      { text: "Reference", url: `${docsRoute}/reference/lottie` },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
