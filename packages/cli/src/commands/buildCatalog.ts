import fs from "node:fs";
import path from "node:path";

const MODELS_ROOT = path.resolve(process.cwd(), "packages/models/src");
const CATALOG_OUTPUT = path.resolve(process.cwd(), "apps/website/src/generated/catalog.json");

/**
 * Scans every model folder's metadata.json and writes a single catalog file
 * the website reads at build time. This is the piece that makes "drop in a
 * new model folder" turn into "it shows up on the site" with zero manual
 * website edits.
 */
export function buildCatalog() {
  const modelDirs = fs
    .readdirSync(MODELS_ROOT)
    .filter((f) => fs.statSync(path.join(MODELS_ROOT, f)).isDirectory());

  const catalog = [];

  for (const dir of modelDirs) {
    const metadataPath = path.join(MODELS_ROOT, dir, "metadata.json");
    if (!fs.existsSync(metadataPath)) {
      console.warn(`⚠ Skipping "${dir}" — no metadata.json found`);
      continue;
    }
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    catalog.push({ ...metadata, slug: dir });
  }

  fs.mkdirSync(path.dirname(CATALOG_OUTPUT), { recursive: true });
  fs.writeFileSync(CATALOG_OUTPUT, JSON.stringify(catalog, null, 2) + "\n");

  console.log(`✓ Catalog built with ${catalog.length} model(s) → ${CATALOG_OUTPUT}`);
}
