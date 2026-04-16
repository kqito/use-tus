import path from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/react-vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (viteConfig) => {
    const { mergeConfig } = await import("vite");
    // Storybook's internal Vite config can override the PostCSS search path.
    // Explicitly restore it to the project root so postcss.config.js is picked up.
    return mergeConfig(viteConfig, {
      css: {
        postcss: path.resolve(__dirname, ".."),
      },
    });
  },
};

export default config;
