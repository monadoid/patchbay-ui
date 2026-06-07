const defaultFontStack = [
  "\"Avenir Next\"",
  "Inter",
  "ui-sans-serif",
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "\"Segoe UI\"",
  "sans-serif",
].join(", ");

export const defaultTheme = {
  "--control-bg": "transparent",
  "--control-active-bg": "transparent",
  "--control-border": "transparent",
  "--focus-border": "#505050",
  "--slider-color": "#282828",
  "--modulation-color": "#6dd7ff",
  "--indicator-color": "#a5a5a5",
  "--indicator-active-color": "#000000",
  "--indicator-border-color": "#505050",
  "--text-color": "#000000",
  "--muted-text-color": "#aaa493",
  "--panel-color": "#282824",
  "--gridline-color": "rgba(255, 255, 255, 0.08)",
  "--control-radius": "2px",
  "--control-font": defaultFontStack,
} as const;

export type ThemeVariable = keyof typeof defaultTheme;
export type Theme = Record<ThemeVariable, string>;
export type ThemeOverrides = Partial<Theme>;

export function createTheme(overrides: ThemeOverrides = {}): Theme {
  return { ...defaultTheme, ...overrides };
}

export function themeStyle(overrides: ThemeOverrides = {}): string {
  return Object.entries(createTheme(overrides))
    .map(([name, value]) => `${name}: ${value};`)
    .join("\n");
}

export const tailwindPreset = {
  theme: {
    extend: {
      colors: {
        patchbay: {
          bg: "var(--control-bg)",
          active: "var(--control-active-bg)",
          border: "var(--control-border)",
          focus: "var(--focus-border)",
          slider: "var(--slider-color)",
          modulation: "var(--modulation-color)",
          indicator: "var(--indicator-color)",
          indicatorActive: "var(--indicator-active-color)",
          indicatorBorder: "var(--indicator-border-color)",
          text: "var(--text-color)",
          muted: "var(--muted-text-color)",
          panel: "var(--panel-color)",
          gridline: "var(--gridline-color)",
        },
      },
      borderRadius: {
        patchbay: "var(--control-radius)",
      },
      fontFamily: {
        patchbay: "var(--control-font)",
      },
    },
  },
} as const;
