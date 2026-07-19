import { Raycaster, Vector3, type Object3D } from "three";

export interface WheelContactPoint {
  /** The wheel's Object3D (used for local-to-world position). */
  object: Object3D;
  /** Rest length of the suspension for this wheel. */
  restLength: number;
  /** Spring stiffness. Higher = stiffer suspension. */
  stiffness: number;
  /** Damping to prevent oscillation. */
  damping: number;
}

export interface TerrainFollowOptions {
  terrain: Object3D;
  wheels: WheelContactPoint[];
  raycastDistance?: number;
}

/**
 * Generalized version of the suspension system built for the portfolio car.
 * Casts a ray downward from each wheel, finds terrain height, and computes
 * a spring-damped suspension offset so the body follows uneven ground.
 *
 * NOTE: this assumes terrain geometry uses the standard Ovium ground convention —
 * a PlaneGeometry rotated -90deg on X, so local Y maps to world Z after rotation.
 * Any model using this helper on custom terrain must account for that flip,
 * exactly like we fixed for the portfolio ground bug.
 */
export function createTerrainFollower(options: TerrainFollowOptions) {
  const raycaster = new Raycaster();
  const down = new Vector3(0, -1, 0);
  const distance = options.raycastDistance ?? 5;

  // Per-wheel spring state, so suspension has memory across frames.
  const wheelState = options.wheels.map(() => ({ velocity: 0, offset: 0 }));

  return {
    /**
     * Call once per frame with delta time. Returns per-wheel suspension
     * offsets (world Y) the caller applies to wheel/body positions.
     */
    update(delta: number): number[] {
      return options.wheels.map((wheel, i) => {
        const worldPos = new Vector3();
        wheel.object.getWorldPosition(worldPos);

        raycaster.set(
          new Vector3(worldPos.x, worldPos.y + distance / 2, worldPos.z),
          down
        );

        const hits = raycaster.intersectObject(options.terrain, true);
        const groundY = hits.length > 0 ? hits[0].point.y : 0;

        const targetOffset = groundY - worldPos.y + wheel.restLength;
        const state = wheelState[i];

        // Spring-damper integration (semi-implicit Euler).
        const springForce = -wheel.stiffness * (state.offset - targetOffset);
        const dampingForce = -wheel.damping * state.velocity;
        state.velocity += (springForce + dampingForce) * delta;
        state.offset += state.velocity * delta;

        return state.offset;
      });
    },
  };
}
