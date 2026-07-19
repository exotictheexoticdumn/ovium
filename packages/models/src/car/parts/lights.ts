import { SphereGeometry, BoxGeometry, Mesh, MeshStandardMaterial, PointLight, Group } from "three";
import type { CarLightOptions } from "../types.js";

export function buildLights(options: CarLightOptions = {}) {
  const group = new Group();
  group.name = "lights";

  const on = options.on ?? true;
  const color = options.color ?? "#fff4d6";
  const intensity = options.intensity ?? 1.2;

  const bulbMaterial = new MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: on ? 1 : 0,
  });

  const barMaterial = new MeshStandardMaterial({
    color: "#dcdcdc",
    roughness: 0.4,
    metalness: 0.6,
  });

  // The roof light bar itself, mounted across the front of the cage top.
  const bar = new Mesh(new BoxGeometry(0.08, 0.06, 1.15), barMaterial);
  bar.position.set(0.5, 1.42, 0);
  bar.name = "lightBar";
  group.add(bar);

  // Four bulbs sitting on top of the bar, matching the reference layout.
  const bulbGeo = new SphereGeometry(0.09, 12, 12);
  const bulbPositions = [-0.42, -0.14, 0.14, 0.42];
  const bulbs: Record<string, Mesh> = {};
  const pointLights: Record<string, PointLight> = {};

  bulbPositions.forEach((z, i) => {
    const bulb = new Mesh(bulbGeo, bulbMaterial);
    bulb.position.set(0.5, 1.5, z);
    bulb.name = `roofBulb${i}`;
    bulbs[`roofBulb${i}`] = bulb;
    group.add(bulb);

    const light = new PointLight(color, on ? intensity : 0, 8);
    light.position.copy(bulb.position);
    pointLights[`roofBulb${i}`] = light;
    group.add(light);
  });

  // Rear taillights (small red panels, matching the reference's rear view).
  const tailMaterial = new MeshStandardMaterial({
    color: "#e0303a",
    emissive: "#e0303a",
    emissiveIntensity: on ? 0.6 : 0,
    roughness: 0.4,
  });
  const tailGeo = new BoxGeometry(0.04, 0.16, 0.3);

  const tailLeft = new Mesh(tailGeo, tailMaterial);
  tailLeft.position.set(-2.0, 0.5, 0.55);
  tailLeft.name = "tailLeft";

  const tailRight = new Mesh(tailGeo, tailMaterial);
  tailRight.position.set(-2.0, 0.5, -0.55);
  tailRight.name = "tailRight";

  group.add(tailLeft, tailRight);

  return {
    group,
    bulbMaterial,
    tailMaterial,
    bulbs,
    pointLights,
    setOn(state: boolean) {
      bulbMaterial.emissiveIntensity = state ? 1 : 0;
      tailMaterial.emissiveIntensity = state ? 0.6 : 0;
      for (const light of Object.values(pointLights)) {
        light.intensity = state ? intensity : 0;
      }
    },
    setColor(newColor: string) {
      bulbMaterial.color.set(newColor);
      bulbMaterial.emissive.set(newColor);
      for (const light of Object.values(pointLights)) {
        light.color.set(newColor);
      }
    },
  };
}

export type CarLights = ReturnType<typeof buildLights>;
