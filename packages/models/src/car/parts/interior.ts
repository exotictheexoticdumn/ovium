import { BoxGeometry, CylinderGeometry, TorusGeometry, Mesh, MeshStandardMaterial, Group } from "three";
import type { CarInteriorOptions } from "../types.js";

export function buildInterior(options: CarInteriorOptions = {}) {
  const group = new Group();
  group.name = "interior";

  const seatMaterial = new MeshStandardMaterial({
    color: options.seatColor ?? "#8a6a4a",
    roughness: 0.85,
  });

  const wheelMaterial = new MeshStandardMaterial({
    color: options.wheelColor ?? "#1a1a1a",
    roughness: 0.6,
  });

  // Bucket seat: a rounded backrest + base, sized to actually read from outside the cage.
  const backrest = new Mesh(new CylinderGeometry(0.28, 0.28, 0.55, 12, 1, false, 0, Math.PI), seatMaterial);
  backrest.rotation.z = Math.PI / 2;
  backrest.rotation.y = Math.PI / 2;
  backrest.position.set(-0.15, 0.85, 0);

  const base = new Mesh(new BoxGeometry(0.5, 0.12, 0.5), seatMaterial);
  base.position.set(0.05, 0.55, 0);

  group.add(backrest, base);

  // Steering wheel, mounted ahead of the seat.
  const steeringWheel = new Mesh(new TorusGeometry(0.2, 0.025, 8, 20), wheelMaterial);
  steeringWheel.position.set(0.55, 0.85, 0);
  steeringWheel.rotation.y = Math.PI / 2.3;
  steeringWheel.name = "steeringWheel";

  const column = new Mesh(new CylinderGeometry(0.03, 0.03, 0.35, 8), wheelMaterial);
  column.rotation.z = Math.PI / 2.6;
  column.position.set(0.4, 0.72, 0);

  group.add(steeringWheel, column);

  return {
    group,
    seatMaterial,
    wheelMaterial,
    steeringWheel,
    setSeatColor(color: string) {
      seatMaterial.color.set(color);
    },
    setWheelColor(color: string) {
      wheelMaterial.color.set(color);
    },
  };
}

export type CarInterior = ReturnType<typeof buildInterior>;
