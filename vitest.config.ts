import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    include: [
      "src/**/__tests__/**/*.test.{ts,tsx}",
      "src/**/*.{spec,test}.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      outputDir: "./coverage",
    },
  },
});
