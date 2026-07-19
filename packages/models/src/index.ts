// Every new model added to packages/models/src/<name>/ gets a matching
// export line here. The CLI's `build-catalog` command generates the
// website's catalog data straight from this same folder structure —
// this file is the npm package's public surface.

export { createCar } from "./car/index.js";
export type { CarOptions, DriveInput } from "./car/index.js";

// --- GENERATED VEHICLE EXPORTS BELOW, DO NOT HAND-EDIT PAST THIS LINE ---
export { createSedan } from "./sedan/index.js";
export type { SedanOptions } from "./sedan/index.js";
export { createSportsSedan } from "./sedan-sports/index.js";
export type { SportsSedanOptions } from "./sedan-sports/index.js";
export { createSportsHatchback } from "./hatchback-sports/index.js";
export type { SportsHatchbackOptions } from "./hatchback-sports/index.js";
export { createSuv } from "./suv/index.js";
export type { SuvOptions } from "./suv/index.js";
export { createLuxurySuv } from "./suv-luxury/index.js";
export type { LuxurySuvOptions } from "./suv-luxury/index.js";
export { createTaxi } from "./taxi/index.js";
export type { TaxiOptions } from "./taxi/index.js";
export { createVan } from "./van/index.js";
export type { VanOptions } from "./van/index.js";
export { createTruck } from "./truck/index.js";
export type { TruckOptions } from "./truck/index.js";
export { createFlatbedTruck } from "./truck-flat/index.js";
export type { FlatbedTruckOptions } from "./truck-flat/index.js";
export { createDeliveryTruck } from "./delivery/index.js";
export type { DeliveryTruckOptions } from "./delivery/index.js";
export { createFlatDeliveryTruck } from "./delivery-flat/index.js";
export type { FlatDeliveryTruckOptions } from "./delivery-flat/index.js";
export { createAmbulance } from "./ambulance/index.js";
export type { AmbulanceOptions } from "./ambulance/index.js";
export { createFireTruck } from "./firetruck/index.js";
export type { FireTruckOptions } from "./firetruck/index.js";
export { createPoliceCar } from "./police/index.js";
export type { PoliceCarOptions } from "./police/index.js";
export { createGarbageTruck } from "./garbage-truck/index.js";
export type { GarbageTruckOptions } from "./garbage-truck/index.js";
export { createTractor } from "./tractor/index.js";
export type { TractorOptions } from "./tractor/index.js";
export { createPoliceTractor } from "./tractor-police/index.js";
export type { PoliceTractorOptions } from "./tractor-police/index.js";
export { createShovelTractor } from "./tractor-shovel/index.js";
export type { ShovelTractorOptions } from "./tractor-shovel/index.js";
export { createRaceCar } from "./race/index.js";
export type { RaceCarOptions } from "./race/index.js";
export { createFutureRaceCar } from "./race-future/index.js";
export type { FutureRaceCarOptions } from "./race-future/index.js";
export { createKartOobi } from "./kart-oobi/index.js";
export type { KartOobiOptions } from "./kart-oobi/index.js";
export { createKartOodi } from "./kart-oodi/index.js";
export type { KartOodiOptions } from "./kart-oodi/index.js";
export { createKartOoli } from "./kart-ooli/index.js";
export type { KartOoliOptions } from "./kart-ooli/index.js";
export { createKartOopi } from "./kart-oopi/index.js";
export type { KartOopiOptions } from "./kart-oopi/index.js";
export { createKartOozi } from "./kart-oozi/index.js";
export type { KartOoziOptions } from "./kart-oozi/index.js";
