import {
  CylinderGeometry,
  TorusGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  DataTexture,
  RepeatWrapping,
  RGBAFormat,
  PlaneGeometry,
  DoubleSide,
} from "three";

/**
 * Creates a cylinder ("tube") mesh running between two points in local space.
 * This is how the roll cage frame is built — a set of these calls, one per bar.
 */
export function tubeBetween(a: Vector3, b: Vector3, radius: number, material: MeshStandardMaterial) {
  const direction = new Vector3().subVectors(b, a);
  const length = direction.length();
  const geometry = new CylinderGeometry(radius, radius, length, 8);

  const mesh = new Mesh(geometry, material);

  const midpoint = new Vector3().addVectors(a, b).multiplyScalar(0.5);
  mesh.position.copy(midpoint);

  // Cylinders are built along Y by default — rotate to point from a to b.
  const up = new Vector3(0, 1, 0);
  mesh.quaternion.setFromUnitVectors(up, direction.clone().normalize());

  return mesh;
}

/**
 * A coilover-style shock: a thin cylinder body with a few stacked rings to
 * read as a coil spring at low-poly resolution. Doesn't need to be a real
 * helix — the rings alone sell it from the distance a preview is viewed at.
 */
export function buildCoilover(
  top: Vector3,
  bottom: Vector3,
  bodyMaterial: MeshStandardMaterial,
  coilMaterial: MeshStandardMaterial
) {
  const shock = tubeBetween(top, bottom, 0.035, bodyMaterial);

  const direction = new Vector3().subVectors(bottom, top);
  const length = direction.length();
  const ringCount = 4;

  const rings = [];
  for (let i = 0; i < ringCount; i++) {
    const t = 0.15 + (i / (ringCount - 1)) * 0.6; // rings sit in the middle 60% of the strut
    const ring = new Mesh(new TorusGeometry(0.09, 0.015, 6, 10), coilMaterial);
    const point = new Vector3().copy(top).addScaledVector(direction, t);
    ring.position.copy(point);
    const up = new Vector3(0, 1, 0);
    ring.quaternion.setFromUnitVectors(up, direction.clone().normalize());
    ring.rotateX(Math.PI / 2);
    rings.push(ring);
  }

  return { shock, rings };
}

/**
 * Procedural diamond-mesh texture (like expanded steel mesh grille material),
 * built as a raw pixel buffer instead of drawn on an HTML canvas. This means
 * it works anywhere — browser, Node-based build tools, SSR — with no DOM
 * dependency, and no external image file to ship alongside the code.
 */
export function createMeshTexture(): DataTexture {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  const center = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Diamond test: manhattan distance from center, normalized to the half-size.
      const dx = Math.abs(x - center) / center;
      const dy = Math.abs(y - center) / center;
      const insideDiamond = dx + dy < 0.82;

      const value = insideDiamond ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = value; // alpha follows the same diamond shape
    }
  }

  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(6, 3);
  texture.needsUpdate = true;
  return texture;
}

export function buildMeshPanel(width: number, height: number, material: MeshStandardMaterial) {
  return new Mesh(new PlaneGeometry(width, height), material);
}

export { DoubleSide };
