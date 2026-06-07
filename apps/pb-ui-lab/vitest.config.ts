import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { defineConfig } from "vitest/config";

const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  test: {
    include: ["src/**/*.browser.test.ts"],
    attachmentsDir: "./.vitest/attachments",
    isolate: true,
    browser: {
      enabled: true,
      headless: true,
      ui: false,
      viewport: {
        width: 1280,
        height: 900,
      },
      screenshotFailures: true,
      trace: {
        mode: "retain-on-failure",
        tracesDir: "./.vitest/browser-traces",
      },
      provider: playwright(),
      instances: [
        {
          browser: "chromium",
        },
      ],
    },
  },
});
