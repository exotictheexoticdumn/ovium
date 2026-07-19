import { BoxGeometry, Mesh, MeshStandardMaterial, Group } from "three";
import type { CarDoorOptions } from "../types.js";

export function buildDoors(options: CarDoorOptions = {}) {
  const group = new Group();
  group.name = "doors";

  const material = new MeshStandardMaterial({
    color: options.color ?? "#c81e3a",
    roughness: 0.4,
    metalness: 0.6,
  });

  const geometry = new BoxGeometry(1.4, 0.85, 0.06);

  const left = new Mesh(geometry, material);
  left.name = "leftDoor";
  left.position.set(0, 0.55, 0.92);

  const right = new Mesh(geometry, material);
  right.name = "rightDoor";
  right.position.set(0, 0.55, -0.92);

  group.add(left, right);

  const closedRotation = { left: 0, right: 0 };
  const openRotation = { left: Math.PI / 2.5, right: -Math.PI / 2.5 };

  if (options.open) {
    left.rotation.y = openRotation.left;
    right.rotation.y = openRotation.right;
  }

  return {
    group,
    material,
    doors: { left, right },
    setColor(color: string) {
      material.color.set(color);
    },
    /** Animates a door open/closed over `duration` seconds. Simple lerp, no tween lib needed. */
    animateDoor(which: "left" | "right", open: boolean, duration = 0.6) {
      const mesh = which === "left" ? left : right;
      const from = mesh.rotation.y;
      const to = open ? openRotation[which] : closedRotation[which];
      const start = performance.now();

      function step() {
        const elapsed = (performance.now() - start) / 1000;
        const t = Math.min(elapsed / duration, 1);
        mesh.rotation.y = from + (to - from) * t;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    },
  };
}

export type CarDoors = ReturnType<typeof buildDoors>;
