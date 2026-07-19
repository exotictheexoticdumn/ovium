import { BoxGeometry, Mesh, MeshStandardMaterial, Group } from "three";
import type { CarBodyOptions } from "../types.js";

export function buildBody(options: CarBodyOptions = {}) {
  const length = options.length ?? 4.2;
  const width = options.width ?? 1.8;
  const height = options.height ?? 1.1;

  const group = new Group();
  group.name = "body";

  const material = new MeshStandardMaterial({
    color: options.color ?? "#c81e3a",
    roughness: options.roughness ?? 0.4,
    metalness: options.metalness ?? 0.6,
  });

  const lowerHull = new Mesh(new BoxGeometry(length, height * 0.6, width), material);
  lowerHull.position.y = height * 0.3;
  lowerHull.name = "lowerHull";

  const cabin = new Mesh(
    new BoxGeometry(length * 0.55, height * 0.55, width * 0.92),
    material
  );
  cabin.position.set(-length * 0.05, height * 0.85, 0);
  cabin.name = "cabin";

  group.add(lowerHull, cabin);

  return {
    group,
    material,
    setColor(color: string) {
      material.color.set(color);
    },
    setFinish(roughness: number, metalness: number) {
      material.roughness = roughness;
      material.metalness = metalness;
    },
  };
}

export type CarBody = ReturnType<typeof buildBody>;
