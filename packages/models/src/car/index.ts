import { Group, Object3D } from "three";
import { disposeObject3D, createTerrainFollower } from "@ovium/core";
import type { OviumModel } from "@ovium/core";
import { buildFrame } from "./parts/frame.js";
import { buildWheels } from "./parts/wheels.js";
import { buildSuspension } from "./parts/suspension.js";
import { buildLights } from "./parts/lights.js";
import { buildInterior } from "./parts/interior.js";
import type { CarOptions, DriveInput } from "./types.js";

export type { CarOptions, DriveInput };

interface CarParts {
  frame: Object3D;
  wheels: Object3D;
  suspension: Object3D;
  lights: Object3D;
  interior: Object3D;
}

export function createCar(options: CarOptions = {}): OviumModel<CarParts, CarOptions> {
  const group = new Group();
  group.name = "ovium-car";

  const frame = buildFrame(options.frame);
  const wheels = buildWheels(options.wheels);
  const suspension = buildSuspension(options.suspension);
  const lights = buildLights(options.lights);
  const interior = buildInterior(options.interior);

  group.add(frame.group, wheels.group, suspension.group, lights.group, interior.group);

  let speed = 0;
  const maxSpeed = 12;
  const acceleration = 8;
  const friction = 4;

  let terrainFollower: ReturnType<typeof createTerrainFollower> | null = null;

  return {
    object3D: group,
    parts: {
      frame: frame.group,
      wheels: wheels.group,
      suspension: suspension.group,
      lights: lights.group,
      interior: interior.group,
    },

    set(patch: Partial<CarOptions>) {
      if (patch.frame?.frameColor) frame.setFrameColor(patch.frame.frameColor);
      if (patch.frame?.panelColor) frame.setPanelColor(patch.frame.panelColor);
      if (patch.wheels?.color) wheels.setColor(patch.wheels.color);
      if (patch.wheels?.rimColor) wheels.setRimColor(patch.wheels.rimColor);
      if (patch.suspension?.shockColor) suspension.setShockColor(patch.suspension.shockColor);
      if (patch.suspension?.coilColor) suspension.setCoilColor(patch.suspension.coilColor);
      if (patch.lights?.on !== undefined) lights.setOn(patch.lights.on);
      if (patch.lights?.color) lights.setColor(patch.lights.color);
      if (patch.interior?.seatColor) interior.setSeatColor(patch.interior.seatColor);
      if (patch.interior?.wheelColor) interior.setWheelColor(patch.interior.wheelColor);
    },

    animate: {
      toggleLights() {
        const isOn = lights.bulbMaterial.emissiveIntensity > 0;
        lights.setOn(!isOn);
      },

      /**
       * Call every frame with input + delta time to drive the car.
       * Velocity integration, wheel spin/steer, delta-time normalized.
       */
      drive(input: DriveInput, delta: number) {
        const targetSpeed = input.throttle * maxSpeed;
        const rate = input.brake ? friction * 3 : acceleration;
        speed += (targetSpeed - speed) * Math.min(1, rate * delta);

        group.position.x += Math.cos(group.rotation.y) * speed * delta;
        group.position.z += Math.sin(group.rotation.y) * speed * delta;

        const steerAmount = input.steer * (speed / maxSpeed) * 2 * delta;
        group.rotation.y += steerAmount;

        wheels.steer(input.steer * 0.5);
        wheels.spin(speed * delta * 3);
      },

      /** Enables terrain-following suspension. Pass the terrain mesh once; call update(delta) each frame. */
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
        const avg = offsets.reduce((a, b) => a + b, 0) / offsets.length;
        frame.group.position.y = avg;
        suspension.group.position.y = avg;
        interior.group.position.y = avg;
        lights.group.position.y = avg;
      }
    },

    dispose() {
      disposeObject3D(group);
    },
  };
}
