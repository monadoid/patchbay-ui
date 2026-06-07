import { defineConfig } from "vite";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 7010,
    fs: {
      allow: [repoRoot],
    },
  },
});
