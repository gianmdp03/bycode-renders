import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const root = path.resolve("../syntah-promo-horizontal");
const snapshot = path.resolve("qa/horizontal-baseline.json");
const manifest = {};
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = path.relative(root, full).replaceAll("\\", "/");
    if (entry.isSymbolicLink())
      manifest[relative] = { link: fs.readlinkSync(full) };
    else if (entry.isDirectory()) walk(full);
    else {
      const stat = fs.statSync(full);
      manifest[relative] = {
        size: stat.size,
        mtime: stat.mtimeMs,
        sha256: crypto
          .createHash("sha256")
          .update(fs.readFileSync(full))
          .digest("hex"),
      };
    }
  }
}
walk(root);
if (process.argv[2] === "capture") {
  assert.ok(!fs.existsSync(snapshot), "Never overwrite the baseline");
  fs.writeFileSync(snapshot, JSON.stringify(manifest));
  console.log(
    `Captured ${Object.keys(manifest).length} horizontal files, including dependencies and Git metadata.`,
  );
} else {
  const baseline = JSON.parse(fs.readFileSync(snapshot, "utf8"));
  assert.deepEqual(
    manifest,
    baseline,
    "Horizontal file contents, sizes, timestamps or file list changed",
  );
  const report = {
    unchanged: true,
    filesChecked: Object.keys(manifest).length,
    method:
      "SHA-256, size, modification timestamp and full file list, including node_modules and .git",
  };
  fs.writeFileSync(
    path.resolve("qa/horizontal-integrity.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
}
