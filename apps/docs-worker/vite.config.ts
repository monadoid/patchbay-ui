import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";

const repoRoot = path.resolve(import.meta.dirname, "../..");

export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      "@patchbayhq/ui/styles.css": path.resolve(
        repoRoot,
        "packages/pb-ui/src/styles.css",
      ),
      "@patchbayhq/ui/tailwind.css": path.resolve(
        repoRoot,
        "packages/pb-ui/src/tailwind.css",
      ),
      "@patchbayhq/ui/theme": path.resolve(
        repoRoot,
        "packages/pb-ui/src/theme.ts",
      ),
      "@patchbayhq/ui": path.resolve(repoRoot, "packages/pb-ui/src/index.ts"),
      "@patchbayhq/svelte": path.resolve(repoRoot, "packages/svelte/src/index.ts"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 7014,
    strictPort: false,
  },
});
