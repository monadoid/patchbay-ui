import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";

const repoRoot = path.resolve(import.meta.dirname, "../..");

export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      "@patchbay/ui/styles.css": path.resolve(
        repoRoot,
        "packages/pb-ui/src/styles.css",
      ),
      "@patchbay/ui/tailwind.css": path.resolve(
        repoRoot,
        "packages/pb-ui/src/tailwind.css",
      ),
      "@patchbay/ui/theme": path.resolve(
        repoRoot,
        "packages/pb-ui/src/theme.ts",
      ),
      "@patchbay/ui": path.resolve(repoRoot, "packages/pb-ui/src/index.ts"),
      "@patchbay/svelte": path.resolve(repoRoot, "packages/svelte/src/index.ts"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 7014,
    strictPort: false,
  },
});
