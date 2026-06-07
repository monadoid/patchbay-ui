import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageDirs = [
  "packages/pb-ui",
  "packages/react",
  "packages/svelte",
];

function readPackageJson(packageDir) {
  const packagePath = join(repoRoot, packageDir, "package.json");
  return JSON.parse(readFileSync(packagePath, "utf8"));
}

function packageVersionExists(packageName, version) {
  try {
    const output = execFileSync(
      "npm",
      ["view", `${packageName}@${version}`, "version", "--json"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();

    return JSON.parse(output) === version;
  } catch (error) {
    const stderr = String(error.stderr ?? "");
    if (stderr.includes("E404") || stderr.includes("404 Not Found")) {
      return false;
    }

    throw error;
  }
}

for (const packageDir of packageDirs) {
  const manifest = readPackageJson(packageDir);
  const packageName = manifest.name;
  const version = manifest.version;

  if (packageVersionExists(packageName, version)) {
    console.log(`${packageName}@${version} already exists; skipping.`);
    continue;
  }

  console.log(`Publishing ${packageName}@${version}...`);
  execFileSync("npm", ["publish", "--access", "public", "--provenance"], {
    cwd: join(repoRoot, packageDir),
    stdio: "inherit",
  });
}
