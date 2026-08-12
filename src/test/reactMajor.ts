import { version } from "react";

/**
 * The React major the suite is running against. The stylesheet-shape tests
 * are written against React 19's hoisting and dedup, so each one skips
 * itself on 18, where the same sheets render in place; `pnpm check:react18`
 * is the lane that runs the suite there.
 */
export const reactMajor = Number(version.split(".")[0]);
