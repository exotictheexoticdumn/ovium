# @ovium/models

Low-poly 3D models for Three.js, built entirely in code. No `.glb`, no `.fbx`, no Blender exports sitting in your repo — every model here is a function that builds a `THREE.Group` at runtime, made of separately editable parts.

Right now there's one model: a car. More are coming, but the car is a good reference for how everything in this package works, so this doc walks through it in full.

## Install

```bash
npm install @ovium/models three
```

`three` is a peer dependency — you bring your own version (anything `>=0.150.0` works), Ovium doesn't ship its own copy or force a specific one on you.

## The basic idea

Instead of importing a static asset, you call a function that returns the model plus a small controller object for interacting with it:

```js
import { createCar } from "@ovium/models";

const car = createCar();
scene.add(car.object3D);
```

`car.object3D` is a normal `THREE.Group`. Add it to your scene, position it, scale it, whatever — it behaves like anything else you'd put in a Three.js scene, because that's exactly what it is.

## Customizing on creation

Pass options into the factory function to set the starting state:

```js
const car = createCar({
  body: { color: "#00ff88", roughness: 0.3, metalness: 0.7 },
  wheels: { color: "#1a1a1a" },
  doors: { color: "#00ff88" },
  lights: { on: true, color: "#fff4d6" },
  interior: { seatColor: "#222", dashColor: "#111" },
});
```

Every field is optional. Anything you don't specify falls back to a sensible default (currently a red paint job with black wheels, if you're curious).

## Changing things after the fact

`car.set()` patches any subset of those same options on a model that's already in your scene — no need to remove and recreate it:

```js
button.addEventListener("click", () => {
  car.set({ body: { color: "#ff00aa" } });
});
```

Only the fields you pass get touched. Everything else on the model stays as it was.

## Getting at individual parts

`car.parts` gives you direct references to the five sub-groups that make up the car, in case you want to do something the API doesn't cover yet — attach something to the roof, hide the interior, whatever:

```js
car.parts.doors.visible = false;
```

The five parts are `body`, `wheels`, `doors`, `lights`, and `interior`.

## Animations

`car.animate` has a handful of named behaviors built in:

```js
car.animate.openDoor("left");        // animates over 0.6s by default
car.animate.openDoor("left", 1.2);   // or pass your own duration in seconds
car.animate.closeDoor("right");
car.animate.toggleLights();
```

## Making it drivable

This is the one that takes a bit more wiring, because driving needs a per-frame update. Call `car.animate.drive()` inside your own render loop with a throttle/steer input and the frame's delta time:

```js
const input = { throttle: 0, steer: 0, brake: false };

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") input.throttle = 1;
  if (e.key === "ArrowDown") input.throttle = -1;
  if (e.key === "ArrowLeft") input.steer = -1;
  if (e.key === "ArrowRight") input.steer = 1;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") input.throttle = 0;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") input.steer = 0;
});

const clock = new THREE.Clock();

function tick() {
  requestAnimationFrame(tick);
  const delta = clock.getDelta();
  car.animate.drive(input, delta);
  renderer.render(scene, camera);
}
tick();
```

This gives you throttle-based acceleration, braking, and steering that scales with speed. It's intentionally lightweight — there's no rigid-body physics under the hood, no collision with other objects. If you need real physics (colliding with obstacles, jumps, that kind of thing), wire the car into Cannon-es or Rapier yourself and use `car.object3D.position` / `.rotation` as the thing your physics engine drives instead.

## Terrain-following suspension

If your car needs to sit correctly on uneven ground instead of a flat plane, hand it your terrain mesh once:

```js
car.animate.enableTerrainFollow(terrainMesh);
```

Then call `car.update(delta)` every frame (alongside `drive()`, not instead of it):

```js
function tick() {
  requestAnimationFrame(tick);
  const delta = clock.getDelta();
  car.animate.drive(input, delta);
  car.update(delta);
  renderer.render(scene, camera);
}
```

Each wheel raycasts down onto your terrain mesh and the body rides a spring-damped average of all four contact points, so it doesn't just clip through hills or float above dips. One thing worth knowing: this assumes your terrain is a `PlaneGeometry` rotated -90° on the X axis, which is the normal way to lay flat ground in Three.js. If your terrain is built some other way, the height sampling might not line up correctly.

## Cleaning up

If you're removing the car from the scene for good (not just hiding it), call `dispose()` so the geometries and materials actually get freed instead of sitting around in GPU memory:

```js
scene.remove(car.object3D);
car.dispose();
```

## Full options reference

| Path | Type | Default |
|---|---|---|
| `body.color` | string (hex) | `#c81e3a` |
| `body.roughness` | number 0–1 | `0.4` |
| `body.metalness` | number 0–1 | `0.6` |
| `body.length` | number (meters) | `4.2` |
| `body.width` | number (meters) | `1.8` |
| `body.height` | number (meters) | `1.1` |
| `wheels.radius` | number (meters) | `0.38` |
| `wheels.width` | number (meters) | `0.28` |
| `wheels.color` | string (hex) | `#111111` |
| `doors.open` | boolean | `false` |
| `doors.color` | string (hex) | `#c81e3a` |
| `lights.on` | boolean | `true` |
| `lights.color` | string (hex) | `#fff4d6` |
| `lights.intensity` | number | `1.2` |
| `interior.seatColor` | string (hex) | `#1a1a1a` |
| `interior.dashColor` | string (hex) | `#222222` |

## A note on React

This package has no React dependency and doesn't assume any framework — it's plain Three.js, so it works the same whether you're in a Vite app, a plain `<script type="module">` tag, or anything else that can run Three.js. There's no official React/R3F wrapper published yet. If that changes, it'll show up as a separate `@ovium/react` package rather than baked into this one, so this package will stay dependency-light either way.

## Status

This is early — `0.0.x` versions, one model, API might still shift a bit as more models get added and patterns get ironed out. If something breaks or feels off, that's useful to know about.

## License

Copyrighted, all rights reserved — see the main project for details. Not open source (yet, at least).

## The vehicle catalog (Kenney Car Kit)

Alongside the procedural car above, this package includes 25 real 3D vehicle models — sedans, SUVs, trucks, an ambulance, a fire truck, go-karts, tractors, and more — sourced from [Kenney's Car Kit](https://kenney.nl/assets/car-kit) (CC0 licensed, free for commercial use).

These work differently from the procedural car: instead of building geometry from primitives at runtime, each one loads a real `.glb` file. That means these are **async** — call the function and `await` it, or use `.then()`:

```js
import { createSedan } from "@ovium/models";

const sedan = await createSedan({ bodyColor: "#2e5fd9", wheelColor: "#111111" });
scene.add(sedan.object3D);
```

Every vehicle in this batch shares the same two options — `bodyColor` and `wheelColor` — and the same `drive(input, delta)` animation as the procedural car, called the same way in your render loop:

```js
function tick() {
  requestAnimationFrame(tick);
  const delta = clock.getDelta();
  sedan.animate.drive(input, delta);
  renderer.render(scene, camera);
}
```

Full list: `createSedan`, `createSportsSedan`, `createSportsHatchback`, `createSuv`, `createLuxurySuv`, `createTaxi`, `createVan`, `createTruck`, `createFlatbedTruck`, `createDeliveryTruck`, `createFlatDeliveryTruck`, `createAmbulance`, `createFireTruck`, `createPoliceCar`, `createGarbageTruck`, `createTractor`, `createPoliceTractor`, `createShovelTractor`, `createRaceCar`, `createFutureRaceCar`, `createKartOobi`, `createKartOodi`, `createKartOoli`, `createKartOopi`, `createKartOozi`.

Note: the go-karts don't have a separate body node in their source file, so `bodyColor` won't do anything on those — `wheelColor` still works.

### Credit

Vehicle models in this package are built on [Kenney's Car Kit](https://kenney.nl/assets/car-kit), licensed CC0 (public domain). Credit isn't required by the license, but Kenney does great work funding an entire studio on donations/Patreon for assets like this — worth a look if you use these a lot: [kenney.nl/donate](https://kenney.nl/donate).
