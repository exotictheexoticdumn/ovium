import { createVehicleFromGLTF } from "@ovium/core";
import type { GLTFVehicleOptions } from "@ovium/core";

// Resolves relative to this built file — bundlers (Vite/Webpack) pick this
// pattern up and copy the asset automatically; in a plain no-bundler browser
// setup it resolves as a normal relative URL against the package's own path.
const ASSET_URL = new URL("../../assets/vehicles/taxi.glb", import.meta.url).href;

export type TaxiOptions = GLTFVehicleOptions;

/**
 * A taxi cab, sedan body with checker livery.
 * GLTF-backed (not procedural) — this returns a Promise, unlike createCar.
 */
export async function createTaxi(options: TaxiOptions = {}) {
  return createVehicleFromGLTF(ASSET_URL, options);
}
