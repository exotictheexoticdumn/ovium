import * as THREE from "three";

// This static preview page has no bundler, so it can't resolve the monorepo's
// local TypeScript packages directly over esm.sh. This builds an equivalent
// buggy from the same primitives as packages/models/src/car/parts/*.ts —
// tube-frame roll cage, coilover struts, tread-block tires — just inlined in
// plain JS. Once @ovium/models is published with a bundled build step, this
// can be swapped for a real `import { createCar } from "@ovium/models"`.

function tubeBetween(a, b, radius, material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const length = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, length, 8);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return mesh;
}

function buildPreviewBuggy() {
  const group = new THREE.Group();
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  const tubeMat = new THREE.MeshStandardMaterial({ color: 0xe8571f, roughness: 0.45, metalness: 0.55 });
  const panelMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5, metalness: 0.1 });

  const chassisFL = V(1.55, 0.4, 0.85), chassisFR = V(1.55, 0.4, -0.85);
  const chassisRL = V(-1.55, 0.4, 0.85), chassisRR = V(-1.55, 0.4, -0.85);
  const cageBaseFL = V(0.55, 0.4, 0.62), cageBaseFR = V(0.55, 0.4, -0.62);
  const cageBaseRL = V(-0.65, 0.4, 0.62), cageBaseRR = V(-0.65, 0.4, -0.62);
  const cageTopFL = V(0.55, 1.35, 0.55), cageTopFR = V(0.55, 1.35, -0.55);
  const cageTopRL = V(-0.65, 1.35, 0.55), cageTopRR = V(-0.65, 1.35, -0.55);

  const bars = [
    [chassisFL, chassisFR], [chassisRL, chassisRR], [chassisFL, chassisRL], [chassisFR, chassisRR],
    [cageBaseFL, cageTopFL], [cageBaseFR, cageTopFR], [cageBaseRL, cageTopRL], [cageBaseRR, cageTopRR],
    [cageTopFL, cageTopFR], [cageTopRL, cageTopRR], [cageTopFL, cageTopRL], [cageTopFR, cageTopRR],
    [cageBaseFL, cageTopFR], [cageBaseRL, cageTopRR],
    [cageBaseFL, chassisFL], [cageBaseFR, chassisFR], [cageBaseRL, chassisRL], [cageBaseRR, chassisRR],
    [chassisFL, V(2.05, 0.55, 0.55)], [chassisFR, V(2.05, 0.55, -0.55)], [V(2.05, 0.55, 0.55), V(2.05, 0.55, -0.55)],
    [chassisRL, V(-2.0, 0.5, 0.55)], [chassisRR, V(-2.0, 0.5, -0.55)], [V(-2.0, 0.5, 0.55), V(-2.0, 0.5, -0.55)],
  ];
  for (const [a, b] of bars) group.add(tubeBetween(a, b, 0.045, tubeMat));

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.9), panelMat);
  nose.position.set(1.95, 0.55, 0);
  const rear = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.85), panelMat);
  rear.position.set(-1.9, 0.5, 0);
  group.add(nose, rear);

  // Wheels: tread-block tires + rim, matching the real model
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.95 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.4, metalness: 0.8 });
  const wheelPositions = [
    [1.55, 0.85], [1.55, -0.85], [-1.55, 0.85], [-1.55, -0.85],
  ];
  const radius = 0.52, width = 0.42;
  const wheelGroups = [];
  for (const [x, z] of wheelPositions) {
    const wheel = new THREE.Group();
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 16);
    tireGeo.rotateZ(Math.PI / 2);
    wheel.add(new THREE.Mesh(tireGeo, tireMat));

    const treadGeo = new THREE.BoxGeometry(width * 1.05, radius * 0.22, radius * 0.3);
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const tread = new THREE.Mesh(treadGeo, tireMat);
      tread.position.set(0, Math.cos(angle) * radius, Math.sin(angle) * radius);
      tread.rotation.x = angle;
      wheel.add(tread);
    }
    const rimGeo = new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, width * 1.02, 8);
    rimGeo.rotateZ(Math.PI / 2);
    wheel.add(new THREE.Mesh(rimGeo, rimMat));

    wheel.position.set(x, radius, z);
    group.add(wheel);
    wheelGroups.push(wheel);
  }

  // Coilover struts
  const shockMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.5, metalness: 0.6 });
  const coilMat = new THREE.MeshStandardMaterial({ color: 0xc94f1f, roughness: 0.4, metalness: 0.6 });
  const struts = [
    [V(1.35, 0.75, 0.78), V(1.55, 0.42, 0.85)],
    [V(1.35, 0.75, -0.78), V(1.55, 0.42, -0.85)],
    [V(-1.35, 0.75, 0.78), V(-1.55, 0.42, 0.85)],
    [V(-1.35, 0.75, -0.78), V(-1.55, 0.42, -0.85)],
  ];
  for (const [top, bottom] of struts) {
    group.add(tubeBetween(top, bottom, 0.035, shockMat));
    const dir = new THREE.Vector3().subVectors(bottom, top);
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + (i / 3) * 0.6;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 6, 10), coilMat);
      ring.position.copy(new THREE.Vector3().copy(top).addScaledVector(dir, t));
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      ring.rotateX(Math.PI / 2);
      group.add(ring);
    }
  }

  // Roof light bar
  const barMat = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, roughness: 0.4, metalness: 0.6 });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.15), barMat);
  bar.position.set(0.5, 1.42, 0);
  group.add(bar);

  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff4d6, emissive: 0xfff4d6, emissiveIntensity: 1 });
  const bulbGeo = new THREE.SphereGeometry(0.09, 12, 12);
  const lights = [];
  for (const z of [-0.42, -0.14, 0.14, 0.42]) {
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0.5, 1.5, z);
    group.add(bulb);
    const point = new THREE.PointLight(0xfff4d6, 1, 8);
    point.position.copy(bulb.position);
    group.add(point);
    lights.push(point);
  }

  return { group, wheelGroups, lights };
}

function initHero() {
  const container = document.getElementById("hero-canvas");
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x404040, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(4, 6, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x88aaff, 0.4);
  rim.position.set(-4, 2, -4);
  scene.add(rim);

  const { group: buggy } = buildPreviewBuggy();
  buggy.position.y = -0.3;
  scene.add(buggy);

  // Camera orbit state — driven by drag, with slow auto-rotation when idle.
  let orbitAngle = -0.7;
  let orbitHeight = 2.4;
  const orbitRadius = 6.2;
  let isDragging = false;
  let lastPointerX = 0;
  let idleTimer = 0;

  function updateCamera() {
    camera.position.set(
      Math.cos(orbitAngle) * orbitRadius,
      orbitHeight,
      Math.sin(orbitAngle) * orbitRadius
    );
    camera.lookAt(0, 0.4, 0);
  }
  updateCamera();

  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (e) => {
    isDragging = true;
    lastPointerX = e.clientX;
    idleTimer = 0;
  });
  window.addEventListener("pointerup", () => { isDragging = false; });
  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointerX;
    orbitAngle += dx * 0.008;
    lastPointerX = e.clientX;
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Entrance animation: buggy rises + fades in via scale, camera settles in.
  let entranceT = 0;
  const entranceDuration = reducedMotion ? 0 : 1.1;
  buggy.scale.set(0.001, 0.001, 0.001);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (entranceT < entranceDuration) {
      entranceT += delta;
      const t = Math.min(entranceT / entranceDuration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      buggy.scale.setScalar(eased);
      buggy.position.y = -0.3 + (1 - eased) * -0.8;
    } else {
      buggy.scale.setScalar(1);
    }

    if (!isDragging) {
      idleTimer += delta;
      if (idleTimer > 1.5 && !reducedMotion) {
        orbitAngle += delta * 0.15;
      }
    }
    updateCamera();

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

async function loadCatalog() {
  const grid = document.getElementById("catalog-grid");
  const countEl = document.getElementById("catalog-count");

  try {
    const res = await fetch("./src/generated/catalog.json");
    const models = await res.json();

    countEl.textContent = `— ${models.length} model${models.length === 1 ? "" : "s"}`;

    models.forEach((model, i) => {
      const card = document.createElement("article");
      card.className = "model-card";
      card.style.animationDelay = `${i * 60}ms`;
      card.innerHTML = `
        <div class="model-card-top">
          <span class="model-name">${model.name}</span>
          <span class="model-category">${model.category}</span>
        </div>
        <p class="model-desc">${model.description}</p>
        <div class="model-import">import { ${model.importName} } from "@ovium/models";</div>
        <div class="model-tags">
          ${model.tags.map((t) => `<span class="model-tag">${t}</span>`).join("")}
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    countEl.textContent = "— couldn't load catalog";
    console.error("Failed to load catalog.json", err);
  }
}

initHero();
loadCatalog();
