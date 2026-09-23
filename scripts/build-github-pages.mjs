import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist/github-pages");
const env = { ...process.env, VITE_GITHUB_PAGES: "true" };
execFileSync("pnpm", ["vite", "build"], { cwd: root, env, stdio: "inherit" });

for (const name of ["assets", "index.html", "404.html", ".nojekyll"]) {
  const target = resolve(root, name);
  if (existsSync(target)) await rm(target, { recursive: true, force: true });
}
await cp(output, root, { recursive: true });
await cp(resolve(root, "index.html"), resolve(root, "404.html"));
await writeFile(resolve(root, ".nojekyll"), "", "utf8");
console.log("GitHub Pages files written to repository root: index.html, 404.html, assets/, .nojekyll");
