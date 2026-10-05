/**
 * Patch Prime `app/index.html` so Arrivals / Eve Out follow room lifecycle.
 *
 *   node scripts/patch-prime-arrival-lifecycle.mjs path/to/app/index.html
 *
 * The desk APK bundles that file. This repo does not build the APK; run the
 * patch in ezhilagam-prime before `build_apk.sh`.
 */
import fs from "node:fs";
import { PRIME_TAG_FLAG_LINES, PRIME_TAG_FLAG_LINES_OLD } from "../src/desk/lifecycle.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/patch-prime-arrival-lifecycle.mjs <index.html>");
  process.exit(1);
}
const html = fs.readFileSync(file, "utf8");
if (html.includes(PRIME_TAG_FLAG_LINES)) {
  console.log("already patched: " + file);
  process.exit(0);
}
const hits = html.split(PRIME_TAG_FLAG_LINES_OLD).length - 1;
if (hits !== 1) {
  console.error("expected the arrivals flag pair once, found " + hits);
  process.exit(1);
}
fs.writeFileSync(file, html.replace(PRIME_TAG_FLAG_LINES_OLD, PRIME_TAG_FLAG_LINES));
console.log("patched arrivals lifecycle in " + file);
