import fs from "fs";
import path from "path";

const dist = path.resolve("dist");
if (!fs.existsSync(dist)) throw new Error("dist/ missing. Run build first.");

const assets = path.join(dist, "assets");
if (!fs.existsSync(assets)) throw new Error("dist/assets missing.");

const files = fs.readdirSync(assets).map((f) => path.join(assets, f));
if (files.length === 0) throw new Error("No assets in dist/assets.");

const totalLimit = 2.5 * 1024 * 1024; // 2.5MB raw
const jsLimit = 900 * 1024; // 900KB raw

let total = 0;
let tooBig = false;

for (const file of files) {
  const stat = fs.statSync(file);
  total += stat.size;
  if (file.endsWith(".js") && stat.size > jsLimit) {
    console.error(`FAIL: JS chunk too large ${path.basename(file)} (${stat.size} bytes)`);
    tooBig = true;
  }
}

if (total > totalLimit) {
  console.error(`FAIL: dist/assets total too large (${total} bytes)`);
  tooBig = true;
}

if (tooBig) process.exit(1);
console.log("DIST BUDGET: PASS ✅");
