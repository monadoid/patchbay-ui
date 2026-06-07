import { describe, expect, test } from "vitest";
import { createTheme, tailwindPreset, themeStyle } from "./theme";

describe("pb-ui theme helpers", () => {
  test("theme overrides stay constrained to known CSS variables", () => {
    const theme = createTheme({
      "--panel-color": "#303030",
      "--control-radius": "3px",
    });

    expect(theme["--panel-color"]).toBe("#303030");
    expect(theme["--control-radius"]).toBe("3px");
    expect(theme["--modulation-color"]).toBe("#6dd7ff");
  });

  test("style helper emits CSS custom property declarations", () => {
    expect(themeStyle({ "--text-color": "#111111" })).toContain("--text-color: #111111;");
  });

  test("tailwind preset exposes package tokens without requiring tailwind as a dependency", () => {
    expect(tailwindPreset.theme.extend.colors.patchbay.panel).toBe(
      "var(--panel-color)",
    );
    expect(tailwindPreset.theme.extend.borderRadius.patchbay).toBe(
      "var(--control-radius)",
    );
    expect(tailwindPreset.theme.extend.fontFamily.patchbay).toBe(
      "var(--control-font)",
    );
  });
});
