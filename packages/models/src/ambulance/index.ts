import { createVehicleFromGLTF } from "@ovium/core";
import type { GLTFVehicleOptions } from "@ovium/core";

// Resolves relative to this built file — bundlers (Vite/Webpack) pick this
// pattern up and copy the asset automatically; in a plain no-bundler browser
// setup it resolves as a normal relative URL against the package's own path.
const ASSET_URL = new URL("../../assets/vehicles/ambulance.glb", import.meta.url).href;

export type AmbulanceOptions = GLTFVehicleOptions;

/**
 * An ambulance with opening rear doors.
 * GLTF-backed (not procedural) — this returns a Promise, unlike createCar.
 */
export async function createAmbulance(options: AmbulanceOptions = {}) {
  return createVehicleFromGLTF(ASSET_URL, options);
}
