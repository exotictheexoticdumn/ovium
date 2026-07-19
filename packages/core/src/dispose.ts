import type { Object3D, Material, Texture } from "three";

function disposeMaterial(material: Material) {
  // Dispose any texture maps attached to the material.
  for (const key of Object.keys(material)) {
    const value = (material as unknown as Record<string, unknown>)[key];
    if (value && typeof value === "object" && "isTexture" in (value as Texture)) {
      (value as Texture).dispose();
    }
  }
  material.dispose();
}

/**
 * Walks an Object3D tree and disposes every geometry/material/texture it owns.
 * Every model's `dispose()` should call this on its root group.
 */
export function disposeObject3D(root: Object3D): void {
  root.traverse((node) => {
    const mesh = node as unknown as { geometry?: { dispose: () => void }; material?: Material | Material[] };

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(disposeMaterial);
      } else {
        disposeMaterial(mesh.material);
      }
    }
  });
}
