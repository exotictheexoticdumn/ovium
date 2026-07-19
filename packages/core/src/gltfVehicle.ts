import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Group, Mesh, MeshStandardMaterial, Object3D } from "three";
import type { OviumModel } from "./types.js";
import { disposeObject3D } from "./dispose.js";

export interface GLTFVehicleOptions {
  bodyColor?: string;
  wheelColor?: string;
  [key: string]: unknown;
}

export interface DriveInput {
  throttle: number;
  steer: number;
  brake: boolean;
}

const WHEEL_NODE_NAMES = ["wheel-front-left", "wheel-front-right", "wheel-back-left", "wheel-back-right"];

function findMaterial(node: Object3D): MeshStandardMaterial | null {
  let found: MeshStandardMaterial | null = null;
  node.traverse((child) => {
    const mesh = child as Mesh;
    if (!found && mesh.isMesh && mesh.material) {
      found = Array.isArray(mesh.material) ? (mesh.material[0] as MeshStandardMaterial) : (mesh.material as MeshStandardMaterial);
    }
  });
  return found;
}

/**
 * Loads a GLTF/GLB-backed vehicle and wraps it in the standard OviumModel
 * shape. Built for the Kenney Car Kit's naming convention (a "body" node
 * plus wheel-front-left/right, wheel-back-left/right), but works for any
 * GLTF file using that same pattern — this is what every real-mesh vehicle
 * in the catalog is built on, instead of one-off loader code per model.
 *
 * Unlike the procedural models (createCar), this is async — loading a real
 * file takes time, so this returns a Promise instead of a plain object.
 */
export async function createVehicleFromGLTF(
  url: string,
  options: GLTFVehicleOptions = {}
): Promise<OviumModel<Record<string, Object3D>, GLTFVehicleOptions>> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  const scene = gltf.scene;

  // Expose every top-level named node as a customizable part — this covers
  // "body" + the four wheels on every vehicle, plus whatever extras a
  // specific model has (grill, doors, a shovel, whatever).
  const parts: Record<string, Object3D> = {};
  for (const child of scene.children) {
    if (child.name) parts[child.name] = child;
  }

  const bodyNode = parts["body"];
  const bodyMaterial = bodyNode ? findMaterial(bodyNode) : null;
  if (bodyMaterial && options.bodyColor) {
    bodyMaterial.color.set(options.bodyColor);
  }

  const wheelNodes = WHEEL_NODE_NAMES.map((name) => parts[name]).filter(Boolean);
  if (options.wheelColor) {
    for (const wheel of wheelNodes) {
      const material = findMaterial(wheel);
      if (material) material.color.set(options.wheelColor);
    }
  }

  let speed = 0;
  const maxSpeed = 10;
  const acceleration = 7;
  const friction = 4;

  return {
    object3D: scene as unknown as Group,
    parts,

    set(patch: Partial<GLTFVehicleOptions>) {
      if (patch.bodyColor && bodyMaterial) {
        bodyMaterial.color.set(patch.bodyColor);
      }
      if (patch.wheelColor) {
        for (const wheel of wheelNodes) {
          const material = findMaterial(wheel);
          if (material) material.color.set(patch.wheelColor);
        }
      }
    },

    animate: {
      /** Same drive pattern as the procedural car — throttle/steer/brake, delta-time normalized. */
      drive(input: DriveInput, delta: number) {
        const targetSpeed = input.throttle * maxSpeed;
        const rate = input.brake ? friction * 3 : acceleration;
        speed += (targetSpeed - speed) * Math.min(1, rate * delta);

        scene.position.x += Math.cos(scene.rotation.y) * speed * delta;
        scene.position.z += Math.sin(scene.rotation.y) * speed * delta;
        scene.rotation.y += input.steer * (speed / maxSpeed) * 2 * delta;

        const spinAmount = speed * delta * 3;
        for (const wheel of wheelNodes) {
          wheel.rotation.x += spinAmount;
        }
        const frontLeft = parts["wheel-front-left"];
        const frontRight = parts["wheel-front-right"];
        const clampedSteer = Math.max(-0.5, Math.min(0.5, input.steer * 0.5));
        if (frontLeft) frontLeft.rotation.y = clampedSteer;
        if (frontRight) frontRight.rotation.y = clampedSteer;
      },
    },

    dispose() {
      disposeObject3D(scene);
    },
  };
}
