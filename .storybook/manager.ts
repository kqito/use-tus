import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "use-tus",
    brandUrl: "https://github.com/kqito/use-tus",
    colorPrimary: "#6366F1",
    colorSecondary: "#6366F1",
    appBg: "#FAFAFA",
    appBorderColor: "#E5E7EB",
    appBorderRadius: 8,
    textColor: "#111827",
    textInverseColor: "#FFFFFF",
    barBg: "#FFFFFF",
    barTextColor: "#6B7280",
    barSelectedColor: "#6366F1",
    barHoverColor: "#4F46E5",
    fontBase:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
    fontCode: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  }),
});
