import fs from "fs";
import path from "path";

const dist = path.resolve("dist");
if (!fs.existsSync(dist)) throw new Error("dist/ missing. Run build first.");

const assets = path.join(dist, "assets");
if (!fs.existsSync(assets)) throw new Error("dist/assets missing.");

const css = fs.readdirSync(assets).filter(f => f.endsWith(".css"));
if (css.length === 0) throw new Error("No CSS assets in dist/assets.");

let foundBad = false;
for (const f of css) {
  const p = path.join(assets, f);
  const s = fs.readFileSync(p, "utf8");
  if (s.includes("@tailwind")) {
    console.error(`FAIL: @tailwind directive found in ${p}`);
    foundBad = true;
  }
}
if (foundBad) process.exit(1);

console.log("CSS COMPILE PROOF: PASS ✅");
