import fs from "node:fs";
import path from "node:path";

const MODELS_ROOT = path.resolve(process.cwd(), "packages/models/src");

const REQUIRED_METADATA_FIELDS = [
  "name",
  "importName",
  "category",
  "tags",
  "version",
  "thumbnail",
  "description",
  "editableProps",
  "animations",
];

function validateOne(modelName: string): string[] {
  const errors: string[] = [];
  const dir = path.join(MODELS_ROOT, modelName);

  if (!fs.existsSync(dir)) {
    return [`Model folder does not exist: ${dir}`];
  }

  const indexPath = path.join(dir, "index.ts");
  if (!fs.existsSync(indexPath)) {
    errors.push(`Missing index.ts`);
  } else {
    const contents = fs.readFileSync(indexPath, "utf-8");
    const isGltfBacked = contents.includes("createVehicleFromGLTF") || contents.includes("createModelFromGLTF");

    if (isGltfBacked) {
      // GLTF-backed models delegate the OviumModel shape to the shared core
      // loader instead of constructing it inline — just confirm they wire
      // up an asset URL and export a create function.
      if (!contents.includes("ASSET_URL")) {
        errors.push(`GLTF-backed model doesn't define an ASSET_URL`);
      }
      if (!/export (async )?function create/.test(contents)) {
        errors.push(`No exported create*() factory function found`);
      }
    } else {
      for (const required of ["object3D", "parts", "set(", "animate", "dispose()"]) {
        if (!contents.includes(required)) {
          errors.push(`index.ts does not appear to return "${required}" — check the OviumModel shape`);
        }
      }
    }
  }

  const metadataPath = path.join(dir, "metadata.json");
  if (!fs.existsSync(metadataPath)) {
    errors.push(`Missing metadata.json`);
  } else {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      for (const field of REQUIRED_METADATA_FIELDS) {
        if (!(field in metadata)) {
          errors.push(`metadata.json missing required field: "${field}"`);
        }
      }
    } catch {
      errors.push(`metadata.json is not valid JSON`);
    }
  }

  const indexContents = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf-8") : "";
  const isGltfBackedForPartsCheck = indexContents.includes("createVehicleFromGLTF") || indexContents.includes("createModelFromGLTF");

  if (!isGltfBackedForPartsCheck) {
    if (!fs.existsSync(path.join(dir, "parts")) || fs.readdirSync(path.join(dir, "parts")).length === 0) {
      errors.push(`No files found in parts/ — models should be broken into per-part files, not one monolith`);
    }
  }

  return errors;
}

export function validate(modelName?: string) {
  const targets = modelName
    ? [modelName]
    : fs.readdirSync(MODELS_ROOT).filter((f) => fs.statSync(path.join(MODELS_ROOT, f)).isDirectory());

  let hasErrors = false;

  for (const target of targets) {
    const errors = validateOne(target);
    if (errors.length === 0) {
      console.log(`✓ ${target} passed validation`);
    } else {
      hasErrors = true;
      console.log(`✗ ${target} failed validation:`);
      for (const err of errors) console.log(`  - ${err}`);
    }
  }

  if (hasErrors) process.exit(1);
}
