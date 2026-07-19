import { SphereGeometry, Mesh, MeshStandardMaterial, PointLight, Group } from "three";
import type { CarLightOptions } from "../types.js";

export function buildLights(options: CarLightOptions = {}) {
  const group = new Group();
  group.name = "lights";

  const on = options.on ?? true;
  const color = options.color ?? "#fff4d6";
  const intensity = options.intensity ?? 1.2;

  const material = new MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: on ? 1 : 0,
  });

  const geometry = new SphereGeometry(0.12, 12, 12);

  const headlightPositions = [
    { name: "frontLeft", x: 2.05, y: 0.55, z: 0.65 },
    { name: "frontRight", x: 2.05, y: 0.55, z: -0.65 },
  ];

  const bulbs: Record<string, Mesh> = {};
  const pointLights: Record<string, PointLight> = {};

  for (const pos of headlightPositions) {
    const bulb = new Mesh(geometry, material);
    bulb.position.set(pos.x, pos.y, pos.z);
    bulb.name = pos.name;
    bulbs[pos.name] = bulb;

    const light = new PointLight(color, on ? intensity : 0, 8);
    light.position.copy(bulb.position);
    pointLights[pos.name] = light;

    group.add(bulb, light);
  }

  return {
    group,
    material,
    bulbs,
    pointLights,
    setOn(state: boolean) {
      material.emissiveIntensity = state ? 1 : 0;
      for (const light of Object.values(pointLights)) {
        light.intensity = state ? intensity : 0;
      }
    },
    setColor(newColor: string) {
      material.color.set(newColor);
      material.emissive.set(newColor);
      for (const light of Object.values(pointLights)) {
        light.color.set(newColor);
      }
    },
  };
}

export type CarLights = ReturnType<typeof buildLights>;
