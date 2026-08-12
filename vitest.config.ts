import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    /* Installs the canvas stub before any test module is evaluated, which is
       what lets a test import lottie-web statically. */
    setupFiles: ["./src/test/setup.ts"],
    /* Spread the defaults rather than restating them, so a later vitest addition
       is not silently lost. `.brain` holds private notes rather than source, and
       vitest collects from the whole repository, so a scratch probe written there
       would otherwise run inside the gate and count towards it. */
    exclude: [...configDefaults.exclude, ".brain/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/index.ts", // Barrel re-export
      ],
      thresholds: {
        statements: 100,
        branches: 90,
        functions: 100,
        lines: 100,
      },
    },
  },
});
