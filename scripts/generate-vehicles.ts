import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VEHICLE_MANIFEST } from "./vehicle-manifest.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_SRC = path.resolve(__dirname, "../packages/models/src");

for (const entry of VEHICLE_MANIFEST) {
  const dir = path.join(MODELS_SRC, entry.slug);
  fs.mkdirSync(dir, { recursive: true });

  const indexTs =
    `import { createVehicleFromGLTF } from "@ovium/core";\n` +
    `import type { GLTFVehicleOptions } from "@ovium/core";\n\n` +
    `// Resolves relative to this built file — bundlers (Vite/Webpack) pick this\n` +
    `// pattern up and copy the asset automatically; in a plain no-bundler browser\n` +
    `// setup it resolves as a normal relative URL against the package's own path.\n` +
    `const ASSET_URL = new URL("../../assets/vehicles/${entry.file}.glb", import.meta.url).href;\n\n` +
    `export type ${entry.displayName}Options = GLTFVehicleOptions;\n\n` +
    `/**\n` +
    ` * ${entry.description}\n` +
    ` * GLTF-backed (not procedural) — this returns a Promise, unlike createCar.\n` +
    ` */\n` +
    `export async function create${entry.displayName}(options: ${entry.displayName}Options = {}) {\n` +
    `  return createVehicleFromGLTF(ASSET_URL, options);\n` +
    `}\n`;

  fs.writeFileSync(path.join(dir, "index.ts"), indexTs);

  const metadata = {
    name: entry.displayName,
    importName: `create${entry.displayName}`,
    category: entry.category,
    tags: entry.tags,
    version: "0.1.0",
    thumbnail: `${entry.slug}.png`,
    description: entry.description,
    editableProps: {
      "bodyColor": { type: "color", default: "#ffffff", description: "Main body paint color (not available on karts, which have no separate body node)" },
      "wheelColor": { type: "color", default: "#1a1a1a" },
    },
    animations: ["drive"],
    source: "Kenney Car Kit (CC0) — https://kenney.nl/assets/car-kit",
  };

  fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(metadata, null, 2) + "\n");

  console.log(`✓ wrote ${entry.slug}`);
}

// Regenerate the models package's index.ts with an export line for every vehicle.
const exportLines = VEHICLE_MANIFEST.map(
  (e) => `export { create${e.displayName} } from "./${e.slug}/index.js";\nexport type { ${e.displayName}Options } from "./${e.slug}/index.js";`
).join("\n");

const indexPath = path.join(MODELS_SRC, "index.ts");
const existing = fs.readFileSync(indexPath, "utf-8");
const marker = "// --- GENERATED VEHICLE EXPORTS BELOW, DO NOT HAND-EDIT PAST THIS LINE ---";
const header = existing.split(marker)[0].trimEnd();

fs.writeFileSync(indexPath, `${header}\n\n${marker}\n${exportLines}\n`);

console.log(`✓ updated index.ts with ${VEHICLE_MANIFEST.length} vehicle exports`);
