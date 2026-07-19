import { Group, MeshStandardMaterial, Vector3 } from "three";
import { buildCoilover } from "./utils.js";
import type { CarSuspensionOptions } from "../types.js";

const STRUT_POSITIONS = [
  { name: "frontLeft", top: new Vector3(1.35, 0.75, 0.78), bottom: new Vector3(1.55, 0.42, 0.85) },
  { name: "frontRight", top: new Vector3(1.35, 0.75, -0.78), bottom: new Vector3(1.55, 0.42, -0.85) },
  { name: "rearLeft", top: new Vector3(-1.35, 0.75, 0.78), bottom: new Vector3(-1.55, 0.42, 0.85) },
  { name: "rearRight", top: new Vector3(-1.35, 0.75, -0.78), bottom: new Vector3(-1.55, 0.42, -0.85) },
] as const;

export function buildSuspension(options: CarSuspensionOptions = {}) {
  const group = new Group();
  group.name = "suspension";

  const bodyMaterial = new MeshStandardMaterial({
    color: options.shockColor ?? "#2b2b2b",
    roughness: 0.5,
    metalness: 0.6,
  });

  const coilMaterial = new MeshStandardMaterial({
    color: options.coilColor ?? "#c94f1f",
    roughness: 0.4,
    metalness: 0.6,
  });

  const struts: Record<string, ReturnType<typeof buildCoilover>> = {};

  for (const pos of STRUT_POSITIONS) {
    const strut = buildCoilover(pos.top, pos.bottom, bodyMaterial, coilMaterial);
    strut.shock.name = `${pos.name}Shock`;
    group.add(strut.shock, ...strut.rings);
    struts[pos.name] = strut;
  }

  return {
    group,
    bodyMaterial,
    coilMaterial,
    setShockColor(color: string) {
      bodyMaterial.color.set(color);
    },
    setCoilColor(color: string) {
      coilMaterial.color.set(color);
    },
  };
}

export type CarSuspension = ReturnType<typeof buildSuspension>;
