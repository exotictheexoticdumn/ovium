import type { Group, Object3D } from "three";

/**
 * Every model factory (createCar, createChair, etc.) must return this shape.
 * This is the contract that keeps every model in the library consistent,
 * regardless of what it actually is.
 */
export interface OviumModel<Parts = Record<string, Object3D>, Options = unknown> {
  /** The root Object3D the user adds to their own scene. */
  object3D: Group;

  /** Direct access to individual named parts (e.g. wheels, doors, body). */
  parts: Parts;

  /** Live-patch any subset of the model's options after creation. */
  set: (patch: Partial<Options>) => void;

  /** Named animations/behaviors exposed by this model. Shape differs per model. */
  animate: Record<string, (...args: any[]) => void>;

  /** Call every frame if the model has per-frame behavior (e.g. driving, physics). */
  update?: (delta: number) => void;

  /** Frees geometries/materials/textures. Always call when removing a model from the scene. */
  dispose: () => void;
}

/** Standard shape every model's metadata.json should match. */
export interface OviumModelMetadata {
  name: string;
  importName: string;
  category: string;
  tags: string[];
  version: string;
  thumbnail: string;
  description: string;
  editableProps: Record<
    string,
    {
      type: "color" | "number" | "boolean" | "string" | "vector3";
      default: unknown;
      description?: string;
    }
  >;
  animations: string[];
}
