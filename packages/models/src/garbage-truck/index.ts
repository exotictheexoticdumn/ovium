import { createVehicleFromGLTF } from "@ovium/core";
import type { GLTFVehicleOptions } from "@ovium/core";

// Resolves relative to this built file — bundlers (Vite/Webpack) pick this
// pattern up and copy the asset automatically; in a plain no-bundler browser
// setup it resolves as a normal relative URL against the package's own path.
const ASSET_URL = new URL("../../assets/vehicles/garbage-truck.glb", import.meta.url).href;

export type GarbageTruckOptions = GLTFVehicleOptions;

/**
 * A garbage truck with a movable arm and trash part.
 * GLTF-backed (not procedural) — this returns a Promise, unlike createCar.
 */
export async function createGarbageTruck(options: GarbageTruckOptions = {}) {
  return createVehicleFromGLTF(ASSET_URL, options);
}
