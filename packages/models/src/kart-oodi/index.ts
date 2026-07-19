import { createVehicleFromGLTF } from "@ovium/core";
import type { GLTFVehicleOptions } from "@ovium/core";

// Resolves relative to this built file — bundlers (Vite/Webpack) pick this
// pattern up and copy the asset automatically; in a plain no-bundler browser
// setup it resolves as a normal relative URL against the package's own path.
const ASSET_URL = new URL("../../assets/vehicles/kart-oodi.glb", import.meta.url).href;

export type KartOodiOptions = GLTFVehicleOptions;

/**
 * A go-kart with a driver character built in.
 * GLTF-backed (not procedural) — this returns a Promise, unlike createCar.
 */
export async function createKartOodi(options: KartOodiOptions = {}) {
  return createVehicleFromGLTF(ASSET_URL, options);
}
