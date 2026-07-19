import fs from "node:fs";
import path from "node:path";

const MODELS_ROOT = path.resolve(process.cwd(), "packages/models/src");

export function createModel(name: string) {
  const modelName = name.trim().toLowerCase();
  const dir = path.join(MODELS_ROOT, modelName);

  if (fs.existsSync(dir)) {
    console.error(`✗ Model "${modelName}" already exists at ${dir}`);
    process.exit(1);
  }

  fs.mkdirSync(path.join(dir, "parts"), { recursive: true });

  const pascalName = modelName.charAt(0).toUpperCase() + modelName.slice(1);

  fs.writeFileSync(
    path.join(dir, "types.ts"),
    `export interface ${pascalName}Options {\n  // TODO: define per-part option groups, e.g.\n  // body?: { color?: string };\n}\n`
  );

  fs.writeFileSync(
    path.join(dir, "parts", "example.ts"),
    `import { Group, Mesh, BoxGeometry, MeshStandardMaterial } from "three";\n\n` +
      `// TODO: replace with the real part builder. One file per logical part\n` +
      `// (e.g. legs.ts, seat.ts, backrest.ts for a chair).\n` +
      `export function buildExample(options: { color?: string } = {}) {\n` +
      `  const group = new Group();\n` +
      `  group.name = "example";\n\n` +
      `  const material = new MeshStandardMaterial({ color: options.color ?? "#888888" });\n` +
      `  const mesh = new Mesh(new BoxGeometry(1, 1, 1), material);\n` +
      `  group.add(mesh);\n\n` +
      `  return {\n` +
      `    group,\n` +
      `    material,\n` +
      `    setColor(color: string) {\n` +
      `      material.color.set(color);\n` +
      `    },\n` +
      `  };\n` +
      `}\n`
  );

  fs.writeFileSync(
    path.join(dir, "index.ts"),
    `import { Group } from "three";\n` +
      `import { disposeObject3D } from "@ovium/core";\n` +
      `import type { OviumModel } from "@ovium/core";\n` +
      `import { buildExample } from "./parts/example.js";\n` +
      `import type { ${pascalName}Options } from "./types.js";\n\n` +
      `export type { ${pascalName}Options };\n\n` +
      `export function create${pascalName}(options: ${pascalName}Options = {}): OviumModel {\n` +
      `  const group = new Group();\n` +
      `  group.name = "ovium-${modelName}";\n\n` +
      `  const example = buildExample();\n` +
      `  group.add(example.group);\n\n` +
      `  return {\n` +
      `    object3D: group,\n` +
      `    parts: { example: example.group },\n` +
      `    set(patch) {\n` +
      `      // TODO: wire patch fields to part setters\n` +
      `    },\n` +
      `    animate: {\n` +
      `      // TODO: named animations\n` +
      `    },\n` +
      `    dispose() {\n` +
      `      disposeObject3D(group);\n` +
      `    },\n` +
      `  };\n` +
      `}\n`
  );

  const metadata = {
    name: pascalName,
    importName: `create${pascalName}`,
    category: "uncategorized",
    tags: [modelName],
    version: "0.0.1",
    thumbnail: `${modelName}.png`,
    description: "TODO: describe this model.",
    editableProps: {},
    animations: [],
  };

  fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(metadata, null, 2) + "\n");

  console.log(`✓ Scaffolded new model "${pascalName}" at ${dir}`);
  console.log(`  Next steps:`);
  console.log(`  1. Build out real parts in ${modelName}/parts/`);
  console.log(`  2. Fill in ${modelName}/metadata.json`);
  console.log(`  3. Export create${pascalName} from packages/models/src/index.ts`);
  console.log(`  4. Run "ovium validate ${modelName}"`);
}
