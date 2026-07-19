import { CylinderGeometry, BoxGeometry, Mesh, MeshStandardMaterial, Group } from "three";
import type { CarWheelOptions } from "../types.js";

const WHEEL_POSITIONS = [
  { name: "frontLeft", x: 1.55, z: 0.85 },
  { name: "frontRight", x: 1.55, z: -0.85 },
  { name: "rearLeft", x: -1.55, z: 0.85 },
  { name: "rearRight", x: -1.55, z: -0.85 },
] as const;

function buildSingleWheel(radius: number, width: number, tireMaterial: MeshStandardMaterial, rimMaterial: MeshStandardMaterial) {
  const wheel = new Group();

  const tireGeo = new CylinderGeometry(radius, radius, width, 16);
  tireGeo.rotateZ(Math.PI / 2);
  const tire = new Mesh(tireGeo, tireMaterial);
  wheel.add(tire);

  // Chunky off-road tread blocks around the tire's circumference.
  const treadCount = 12;
  const treadGeo = new BoxGeometry(width * 1.05, radius * 0.22, radius * 0.3);
  for (let i = 0; i < treadCount; i++) {
    const angle = (i / treadCount) * Math.PI * 2;
    const tread = new Mesh(treadGeo, tireMaterial);
    tread.position.set(0, Math.cos(angle) * radius, Math.sin(angle) * radius);
    tread.rotation.x = angle;
    wheel.add(tread);
  }

  // Inner rim disc, slightly recessed on each side.
  const rimGeo = new CylinderGeometry(radius * 0.55, radius * 0.55, width * 1.02, 8);
  rimGeo.rotateZ(Math.PI / 2);
  const rim = new Mesh(rimGeo, rimMaterial);
  wheel.add(rim);

  return wheel;
}

export function buildWheels(options: CarWheelOptions = {}) {
  const radius = options.radius ?? 0.52;
  const width = options.width ?? 0.42;

  const group = new Group();
  group.name = "wheels";

  const tireMaterial = new MeshStandardMaterial({
    color: options.color ?? "#161616",
    roughness: 0.95,
    metalness: 0.05,
  });

  const rimMaterial = new MeshStandardMaterial({
    color: options.rimColor ?? "#8a8a8a",
    roughness: 0.4,
    metalness: 0.8,
  });

  const wheelMeshes: Record<string, Group> = {};

  for (const pos of WHEEL_POSITIONS) {
    const wheel = buildSingleWheel(radius, width, tireMaterial, rimMaterial);
    wheel.position.set(pos.x, radius, pos.z);
    wheel.name = pos.name;
    wheelMeshes[pos.name] = wheel;
    group.add(wheel);
  }

  return {
    group,
    tireMaterial,
    rimMaterial,
    wheelMeshes,
    setColor(color: string) {
      tireMaterial.color.set(color);
    },
    setRimColor(color: string) {
      rimMaterial.color.set(color);
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
