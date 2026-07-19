export interface VehicleManifestEntry {
  slug: string;
  file: string;
  displayName: string;
  category: string;
  tags: string[];
  description: string;
}

export const VEHICLE_MANIFEST: VehicleManifestEntry[] = [
  { slug: "sedan", file: "sedan", displayName: "Sedan", category: "cars", tags: ["car", "sedan", "low-poly"], description: "A standard low-poly sedan." },
  { slug: "sedan-sports", file: "sedan-sports", displayName: "SportsSedan", category: "cars", tags: ["car", "sedan", "sports", "low-poly"], description: "A sportier take on the sedan body style." },
  { slug: "hatchback-sports", file: "hatchback-sports", displayName: "SportsHatchback", category: "cars", tags: ["car", "hatchback", "sports", "low-poly"], description: "A compact sports hatchback." },
  { slug: "suv", file: "suv", displayName: "Suv", category: "cars", tags: ["car", "suv", "low-poly"], description: "A standard SUV body style." },
  { slug: "suv-luxury", file: "suv-luxury", displayName: "LuxurySuv", category: "cars", tags: ["car", "suv", "luxury", "low-poly"], description: "A luxury SUV variant." },
  { slug: "taxi", file: "taxi", displayName: "Taxi", category: "cars", tags: ["car", "taxi", "low-poly"], description: "A taxi cab, sedan body with checker livery." },
  { slug: "van", file: "van", displayName: "Van", category: "commercial", tags: ["van", "commercial", "low-poly"], description: "A cargo van body style." },
  { slug: "truck", file: "truck", displayName: "Truck", category: "commercial", tags: ["truck", "commercial", "low-poly"], description: "A pickup truck." },
  { slug: "truck-flat", file: "truck-flat", displayName: "FlatbedTruck", category: "commercial", tags: ["truck", "flatbed", "commercial", "low-poly"], description: "A flatbed pickup truck." },
  { slug: "delivery", file: "delivery", displayName: "DeliveryTruck", category: "commercial", tags: ["truck", "delivery", "commercial", "low-poly"], description: "A boxy delivery van/truck." },
  { slug: "delivery-flat", file: "delivery-flat", displayName: "FlatDeliveryTruck", category: "commercial", tags: ["truck", "delivery", "commercial", "low-poly"], description: "A flat-front delivery truck." },
  { slug: "ambulance", file: "ambulance", displayName: "Ambulance", category: "emergency", tags: ["emergency", "ambulance", "low-poly"], description: "An ambulance with opening rear doors." },
  { slug: "firetruck", file: "firetruck", displayName: "FireTruck", category: "emergency", tags: ["emergency", "firetruck", "low-poly"], description: "A fire truck with a front grill part." },
  { slug: "police", file: "police", displayName: "PoliceCar", category: "emergency", tags: ["emergency", "police", "low-poly"], description: "A police cruiser with a front grill part." },
  { slug: "garbage-truck", file: "garbage-truck", displayName: "GarbageTruck", category: "municipal", tags: ["municipal", "garbage-truck", "low-poly"], description: "A garbage truck with a movable arm and trash part." },
  { slug: "tractor", file: "tractor", displayName: "Tractor", category: "agriculture", tags: ["tractor", "agriculture", "low-poly"], description: "A farm tractor." },
  { slug: "tractor-police", file: "tractor-police", displayName: "PoliceTractor", category: "agriculture", tags: ["tractor", "agriculture", "police", "low-poly"], description: "A tractor with police livery (yes, really — it's in the kit)." },
  { slug: "tractor-shovel", file: "tractor-shovel", displayName: "ShovelTractor", category: "agriculture", tags: ["tractor", "agriculture", "shovel", "low-poly"], description: "A tractor with a front shovel/loader part." },
  { slug: "race", file: "race", displayName: "RaceCar", category: "racing", tags: ["race", "racing", "low-poly"], description: "A stylized race car." },
  { slug: "race-future", file: "race-future", displayName: "FutureRaceCar", category: "racing", tags: ["race", "racing", "futuristic", "low-poly"], description: "A futuristic/concept race car." },
  { slug: "kart-oobi", file: "kart-oobi", displayName: "KartOobi", category: "karts", tags: ["kart", "racing", "low-poly"], description: "A go-kart with a driver character built in." },
  { slug: "kart-oodi", file: "kart-oodi", displayName: "KartOodi", category: "karts", tags: ["kart", "racing", "low-poly"], description: "A go-kart with a driver character built in." },
  { slug: "kart-ooli", file: "kart-ooli", displayName: "KartOoli", category: "karts", tags: ["kart", "racing", "low-poly"], description: "A go-kart with a driver character built in." },
  { slug: "kart-oopi", file: "kart-oopi", displayName: "KartOopi", category: "karts", tags: ["kart", "racing", "low-poly"], description: "A go-kart with a driver character built in." },
  { slug: "kart-oozi", file: "kart-oozi", displayName: "KartOozi", category: "karts", tags: ["kart", "racing", "low-poly"], description: "A go-kart with a driver character built in." },
];
