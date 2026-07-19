import { Group, Object3D } from "three";
import { disposeObject3D, createTerrainFollower } from "@ovium/core";
import type { OviumModel } from "@ovium/core";
import { buildBody } from "./parts/body.js";
import { buildWheels } from "./parts/wheels.js";
import { buildDoors } from "./parts/doors.js";
import { buildLights } from "./parts/lights.js";
import { buildInterior } from "./parts/interior.js";
import type { CarOptions, DriveInput } from "./types.js";

export type { CarOptions, DriveInput };

interface CarParts {
  body: Object3D;
  wheels: Object3D;
  doors: Object3D;
  lights: Object3D;
  interior: Object3D;
}

export function createCar(options: CarOptions = {}): OviumModel<CarParts, CarOptions> {
  const group = new Group();
  group.name = "ovium-car";

  const body = buildBody(options.body);
  const wheels = buildWheels(options.wheels);
  const doors = buildDoors(options.doors);
  const lights = buildLights(options.lights);
  const interior = buildInterior(options.interior);

  group.add(body.group, wheels.group, doors.group, lights.group, interior.group);

  // Simple velocity state for driving; not full rigid-body physics.
  // Users who want full physics wire terrainFollower/update into their own
  // physics step (Cannon/Rapier) instead — this is the lightweight default.
  let speed = 0;
  const maxSpeed = 12; // m/s
  const acceleration = 8;
  const friction = 4;

  let terrainFollower: ReturnType<typeof createTerrainFollower> | null = null;

  return {
    object3D: group,
    parts: {
      body: body.group,
      wheels: wheels.group,
      doors: doors.group,
      lights: lights.group,
      interior: interior.group,
    },

    set(patch: Partial<CarOptions>) {
      if (patch.body?.color) body.setColor(patch.body.color);
      if (patch.body?.roughness !== undefined || patch.body?.metalness !== undefined) {
        body.setFinish(
          patch.body.roughness ?? body.material.roughness,
          patch.body.metalness ?? body.material.metalness
        );
      }
      if (patch.wheels?.color) wheels.setColor(patch.wheels.color);
      if (patch.doors?.color) doors.setColor(patch.doors.color);
      if (patch.lights?.on !== undefined) lights.setOn(patch.lights.on);
      if (patch.lights?.color) lights.setColor(patch.lights.color);
      if (patch.interior?.seatColor) interior.setSeatColor(patch.interior.seatColor);
      if (patch.interior?.dashColor) interior.setDashColor(patch.interior.dashColor);
    },

    animate: {
      openDoor(which: "left" | "right", duration = 0.6) {
        doors.animateDoor(which, true, duration);
      },
      closeDoor(which: "left" | "right", duration = 0.6) {
        doors.animateDoor(which, false, duration);
      },
      toggleLights() {
        const isOn = lights.material.emissiveIntensity > 0;
        lights.setOn(!isOn);
      },

      /**
       * Call every frame with input + delta time to drive the car.
       * This is the same pattern used in the portfolio build: velocity
       * integration, wheel spin/steer, delta-time normalized.
       */
      drive(input: DriveInput, delta: number) {
        const targetSpeed = input.throttle * maxSpeed;
        const rate = input.brake ? friction * 3 : acceleration;
        speed += (targetSpeed - speed) * Math.min(1, rate * delta);

        // Move forward along the car's current facing direction.
        const forward = new Object3D();
        group.getWorldDirection(forward.position);
        group.position.x += Math.cos(group.rotation.y) * speed * delta;
        group.position.z += Math.sin(group.rotation.y) * speed * delta;

        // Steering only takes effect while moving.
        const steerAmount = input.steer * (speed / maxSpeed) * 2 * delta;
        group.rotation.y += steerAmount;

        wheels.steer(input.steer * 0.5);
        wheels.spin(speed * delta * 3);
      },

      /**
       * Enables terrain-following suspension for this car. Pass the terrain
       * mesh once; call update(delta) each frame afterward (or rely on the
       * model's own update() if you don't need manual control).
       */
      enableTerrainFollow(terrain: Object3D) {
        terrainFollower = createTerrainFollower({
          terrain,
          wheels: [
            { object: wheels.wheelMeshes.frontLeft, restLength: 0.05, stiffness: 40, damping: 6 },
            { object: wheels.wheelMeshes.frontRight, restLength: 0.05, stiffness: 40, damping: 6 },
            { object: wheels.wheelMeshes.rearLeft, restLength: 0.05, stiffness: 40, damping: 6 },
            { object: wheels.wheelMeshes.rearRight, restLength: 0.05, stiffness: 40, damping: 6 },
          ],
        });
      },
    },

    update(delta: number) {
      if (terrainFollower) {
        const offsets = terrainFollower.update(delta);
        // Body rides on the average of all four wheel offsets.
        const avg = offsets.reduce((a, b) => a + b, 0) / offsets.length;
        body.group.position.y = avg;
      }
    },

    dispose() {
      disposeObject3D(group);
    },
  };
}
