import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export const GET = () => {
  const archivePath = path.resolve(process.cwd(), "../dist/fewer-parts.zip");
  const built = statSync(archivePath).mtimeMs;
  const checkFresh = (target: string) => {
    if (statSync(target).isDirectory()) {
      for (const name of readdirSync(target)) {
        checkFresh(path.resolve(target, name));
      }
    } else if (statSync(target).mtimeMs > built) {
      throw new Error(
        "Skill download is stale. Run python scripts/release.py package from the repository root before building the website."
      );
    }
  };
  for (const entry of ["skills/fewer-parts", "LICENSE", "NOTICE.md"]) {
    checkFresh(path.resolve(process.cwd(), "..", entry));
  }
  const archive = readFileSync(archivePath);
  return new Response(new Uint8Array(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="fewer-parts.zip"',
    },
  });
};
