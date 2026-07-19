# @ovium/core

Shared runtime pieces used by every model in the Ovium ecosystem. You probably don't need to install this directly — it comes in automatically as a dependency of `@ovium/models` — but here's what's in it in case you're building your own model on top of it, or just want to know what's happening under the hood.

## Install

```bash
npm install @ovium/core three
```

Same deal as `@ovium/models`: `three` is a peer dependency, bring your own version `>=0.150.0`.

## What's actually in here

### The `OviumModel` shape

Every model in `@ovium/models` (the car, and whatever comes after it) returns an object matching this shape:

```ts
interface OviumModel {
  object3D: THREE.Group;      // add this to your scene
  parts: Record<string, Object3D>;  // named sub-parts of the model
  set(patch): void;           // live-patch options after creation
  animate: Record<string, Function>; // named animations/behaviors
  update?(delta: number): void; // call every frame, if the model needs it
  dispose(): void;            // frees geometry/material/texture memory
}
```

This is exported as a TypeScript type (`OviumModel`) so if you're scaffolding your own model with the CLI, your model's return value can be typed against it directly.

### `disposeObject3D(root)`

Walks a `THREE.Object3D` tree and calls `.dispose()` on every geometry, material, and texture it finds. Every model's own `dispose()` method calls this internally — you don't need to call it yourself unless you're building something outside the standard model pattern.

```js
import { disposeObject3D } from "@ovium/core";

disposeObject3D(someGroup);
```

### `createTerrainFollower(options)`

The suspension/terrain-following system used by the car's `enableTerrainFollow()`. Casts a ray down from each wheel position, finds the ground height, and runs a spring-damper so the body doesn't clip through hills or float above dips.

```js
import { createTerrainFollower } from "@ovium/core";

const follower = createTerrainFollower({
  terrain: terrainMesh,
  wheels: [
    { object: wheelMesh1, restLength: 0.05, stiffness: 40, damping: 6 },
    // ...one entry per contact point
  ],
});

// each frame:
const offsets = follower.update(delta); // array of Y offsets, one per wheel
```

One assumption baked in here: it expects ground built as a `PlaneGeometry` rotated -90° on the X axis (the standard way to lay flat terrain in Three.js). If your terrain is built differently, the raycasting math may not line up.

## Status

Early days — `0.0.x`, small surface area, will grow as more models need shared behavior (things like door-hinge animation or wheel-spin logic might graduate here if enough models end up needing the same pattern).

## License

Copyrighted, all rights reserved — see the main Ovium project for details.
