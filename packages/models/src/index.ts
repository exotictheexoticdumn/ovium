// Every new model added to packages/models/src/<name>/ gets a matching
// export line here. The CLI's `build-catalog` command generates the
// website's catalog data straight from this same folder structure —
// this file is the npm package's public surface.

export { createCar } from "./car/index.js";
export type { CarOptions, DriveInput } from "./car/index.js";
