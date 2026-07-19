import { CylinderGeometry, Mesh, MeshStandardMaterial, Group } from "three";
import type { CarWheelOptions } from "../types.js";

const WHEEL_POSITIONS = [
  { name: "frontLeft", x: 1.3, z: 0.95 },
  { name: "frontRight", x: 1.3, z: -0.95 },
  { name: "rearLeft", x: -1.3, z: 0.95 },
  { name: "rearRight", x: -1.3, z: -0.95 },
] as const;

export function buildWheels(options: CarWheelOptions = {}) {
  const radius = options.radius ?? 0.38;
  const width = options.width ?? 0.28;

  const group = new Group();
  group.name = "wheels";

  const material = new MeshStandardMaterial({
    color: options.color ?? "#111111",
    roughness: 0.9,
    metalness: 0.1,
  });

  const geometry = new CylinderGeometry(radius, radius, width, 20);
  geometry.rotateZ(Math.PI / 2);

  const wheelMeshes: Record<string, Mesh> = {};

  for (const pos of WHEEL_POSITIONS) {
    const wheel = new Mesh(geometry, material);
    wheel.position.set(pos.x, radius, pos.z);
    wheel.name = pos.name;
    wheelMeshes[pos.name] = wheel;
    group.add(wheel);
  }

  return {
    group,
    material,
    wheelMeshes,
    setColor(color: string) {
      material.color.set(color);
    },
    /** Rotates all wheels around their axle — call from the drive loop. */
    spin(radians: number) {
      for (const wheel of Object.values(wheelMeshes)) {
        wheel.rotation.x += radians;
      }
    },
    /** Steers the front wheels only, clamped to a realistic max angle. */
    steer(angleRadians: number) {
      const clamped = Math.max(-0.55, Math.min(0.55, angleRadians));
      wheelMeshes.frontLeft.rotation.y = clamped;
      wheelMeshes.frontRight.rotation.y = clamped;
    },
  };
}

export type CarWheels = ReturnType<typeof buildWheels>;
