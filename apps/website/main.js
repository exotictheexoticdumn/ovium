import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Assets are fetched from the published npm package via jsDelivr — this means
// the site automatically reflects whatever's currently published, with no
// asset-copying step between the repo and the deployed site.
const CDN_BASE = "https://cdn.jsdelivr.net/npm/@ovium/models/assets/vehicles/";

function tubeBetween(a, b, radius, material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const length = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, length, 8);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return mesh;
}

// Equivalent to packages/models/src/car/parts/*.ts, inlined since this static
// page has no bundler to resolve the monorepo's local TS packages.
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

  const tireMat = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.95 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.4, metalness: 0.8 });
  const wheelPositions = [[1.55, 0.85], [1.55, -0.85], [-1.55, 0.85], [-1.55, -0.85]];
  const radius = 0.52, width = 0.42;
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
  }

  const shockMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.5, metalness: 0.6 });
  const coilMat = new THREE.MeshStandardMaterial({ color: 0xc94f1f, roughness: 0.4, metalness: 0.6 });
  const struts = [
    [V(1.35, 0.75, 0.78), V(1.55, 0.42, 0.85)], [V(1.35, 0.75, -0.78), V(1.55, 0.42, -0.85)],
    [V(-1.35, 0.75, 0.78), V(-1.55, 0.42, 0.85)], [V(-1.35, 0.75, -0.78), V(-1.55, 0.42, -0.85)],
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

  const barMat = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, roughness: 0.4, metalness: 0.6 });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.15), barMat);
  bar.position.set(0.5, 1.42, 0);
  group.add(bar);

  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff4d6, emissive: 0xfff4d6, emissiveIntensity: 1 });
  const bulbGeo = new THREE.SphereGeometry(0.09, 12, 12);
  for (const z of [-0.42, -0.14, 0.14, 0.42]) {
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0.5, 1.5, z);
    group.add(bulb);
    const point = new THREE.PointLight(0xfff4d6, 1, 8);
    point.position.copy(bulb.position);
    group.add(point);
  }

  return group;
}

function drawGaugeTicks() {
  const svg = document.getElementById("gauge-ticks");
  if (!svg) return;
  const cx = 200, cy = 200, rOuter = 196, rInnerMinor = 182, rInnerMajor = 172;
  const totalTicks = 48;

  for (let i = 0; i < totalTicks; i++) {
    const angle = (i / totalTicks) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 6 === 0;
    const rInner = isMajor ? rInnerMajor : rInnerMinor;
    const x1 = cx + Math.cos(angle) * rOuter;
    const y1 = cy + Math.sin(angle) * rOuter;
    const x2 = cx + Math.cos(angle) * rInner;
    const y2 = cy + Math.sin(angle) * rInner;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    if (isMajor) line.setAttribute("class", "major");
    svg.appendChild(line);
  }
}

async function loadHeroEntry(entry) {
  if (entry.type === "procedural") {
    return { group: buildPreviewBuggy(), label: entry.label };
  }
  try {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(`${CDN_BASE}${entry.file}.glb`);
    return { group: gltf.scene, label: entry.label };
  } catch (err) {
    console.warn(`Hero: couldn't load ${entry.file}, skipping`, err);
    return null;
  }
}

function initHero() {
  drawGaugeTicks();

  const container = document.getElementById("hero-canvas");
  const readout = document.getElementById("gauge-readout");
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
  const rim = new THREE.DirectionalLight(0xff8855, 0.4);
  rim.position.set(-4, 2, -4);
  scene.add(rim);

  let orbitAngle = -0.7;
  const orbitHeight = 2.3;
  const orbitRadius = 6.0;
  let isDragging = false;
  let lastPointerX = 0;
  let idleTimer = 0;

  function updateCamera() {
    camera.position.set(Math.cos(orbitAngle) * orbitRadius, orbitHeight, Math.sin(orbitAngle) * orbitRadius);
    camera.lookAt(0, 0.4, 0);
  }
  updateCamera();

  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (e) => { isDragging = true; lastPointerX = e.clientX; idleTimer = 0; });
  window.addEventListener("pointerup", () => { isDragging = false; });
  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    orbitAngle += (e.clientX - lastPointerX) * 0.008;
    lastPointerX = e.clientX;
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new THREE.Clock();

  let currentGroup = null;
  let entranceT = 0;
  const entranceDuration = reducedMotion ? 0 : 0.7;

  function showGroup(group) {
    if (currentGroup) scene.remove(currentGroup);
    currentGroup = group;
    currentGroup.position.y = -0.3;
    currentGroup.scale.set(0.001, 0.001, 0.001);
    scene.add(currentGroup);
    entranceT = 0;
  }

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (currentGroup) {
      if (entranceT < entranceDuration) {
        entranceT += delta;
        const t = Math.min(entranceT / entranceDuration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        currentGroup.scale.setScalar(eased);
      } else {
        currentGroup.scale.setScalar(1);
      }
    }

    if (!isDragging) {
      idleTimer += delta;
      if (idleTimer > 1.2 && !reducedMotion) orbitAngle += delta * 0.15;
    }
    updateCamera();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Carousel: cycles through a few models. The procedural buggy always
  // works; the real vehicles depend on @ovium/models being published with
  // its assets — if a fetch fails (e.g. not published yet), it's skipped
  // silently rather than breaking the rotation.
  const heroEntries = [
    { type: "procedural", label: "BUGGY (procedural)" },
    { type: "gltf", file: "sedan", label: "SEDAN" },
    { type: "gltf", file: "ambulance", label: "AMBULANCE" },
    { type: "gltf", file: "race", label: "RACE CAR" },
    { type: "gltf", file: "tractor-shovel", label: "SHOVEL TRACTOR" },
  ];

  let index = 0;
  async function cycle() {
    let attempts = 0;
    while (attempts < heroEntries.length) {
      const entry = heroEntries[index % heroEntries.length];
      index++;
      attempts++;
      const loaded = await loadHeroEntry(entry);
      if (loaded) {
        showGroup(loaded.group);
        if (readout) readout.textContent = loaded.label;
        return;
      }
    }
  }

  cycle();
  if (!reducedMotion) {
    setInterval(cycle, 6000);
  }
}

function initCardPreview(canvasContainer, glbFile) {
  let renderer, scene, camera, group;
  let started = false;

  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !started) {
        started = true;
        start();
      }
    }
  }, { threshold: 0.1 });
  observer.observe(canvasContainer);

  async function start() {
    const width = canvasContainer.clientWidth || 260;
    const height = canvasContainer.clientHeight || 195;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(3.4, 2.0, 3.6);
    camera.lookAt(0, 0.3, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    canvasContainer.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x404040, 1.3));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(4, 5, 3);
    scene.add(key);

    try {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(`${CDN_BASE}${glbFile}.glb`);
      group = gltf.scene;
      scene.add(group);
    } catch (err) {
      canvasContainer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-dim);font-family:var(--font-mono);font-size:11px;">preview unavailable</div>`;
      return;
    }

    function animate() {
      requestAnimationFrame(animate);
      if (group) group.rotation.y += 0.006;
      renderer.render(scene, camera);
    }
    animate();
  }
}

async function loadCatalog() {
  const grid = document.getElementById("catalog-grid");
  const countEl = document.getElementById("catalog-count");

  try {
    const res = await fetch("./src/generated/catalog.json");
    const models = await res.json();

    countEl.textContent = `— ${models.length} model${models.length === 1 ? "" : "s"}`;

    models.forEach((model, i) => {
      const card = document.createElement("a");
      card.className = "model-card";
      card.href = `./model.html?model=${encodeURIComponent(model.slug)}`;
      card.style.animationDelay = `${i * 40}ms`;
      card.innerHTML = `
      <div class="card-preview"></div>
      <div class="card-body">
      <div class="card-top">
      <span class="card-name">${model.name}</span>
      <span class="card-category">${model.category}</span>
      </div>
      <div class="card-import">${model.importName}()</div>
      </div>
      `;
      grid.appendChild(card);

      // The procedural car has no .glb to preview — skip the live thumbnail for it.
      if (model.slug !== "car") {
        const previewEl = card.querySelector(".card-preview");
        initCardPreview(previewEl, model.slug);
      }
    });
  } catch (err) {
    countEl.textContent = "— couldn't load catalog";
    console.error("Failed to load catalog.json", err);
  }
}

initHero();
loadCatalog();
