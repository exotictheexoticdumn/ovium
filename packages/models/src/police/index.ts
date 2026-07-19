import { createVehicleFromGLTF } from "@ovium/core";
import type { GLTFVehicleOptions } from "@ovium/core";

// Resolves relative to this built file — bundlers (Vite/Webpack) pick this
// pattern up and copy the asset automatically; in a plain no-bundler browser
// setup it resolves as a normal relative URL against the package's own path.
const ASSET_URL = new URL("../../assets/vehicles/police.glb", import.meta.url).href;

export type PoliceCarOptions = GLTFVehicleOptions;

/**
 * A police cruiser with a front grill part.
 * GLTF-backed (not procedural) — this returns a Promise, unlike createCar.
 */
export async function createPoliceCar(options: PoliceCarOptions = {}) {
  return createVehicleFromGLTF(ASSET_URL, options);
}
