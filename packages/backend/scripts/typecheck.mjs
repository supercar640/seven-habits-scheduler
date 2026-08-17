import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const generated = fileURLToPath(new URL("../convex/_generated", import.meta.url));

if (!existsSync(generated)) {
  console.log(
    "[backend] convex/_generated not found. Run `pnpm --filter @seven-habits/backend dev` " +
      "(convex dev) once with your Convex account to generate it. Skipping typecheck.",
  );
  process.exit(0);
}

execSync("tsc --noEmit", { stdio: "inherit" });
