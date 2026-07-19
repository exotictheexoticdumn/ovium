import * as THREE from "three";

// NOTE: this static preview page has no bundler, so it can't resolve the
// monorepo's local TypeScript packages directly over esm.sh. It renders an
// equivalent low-poly car built from the same primitives as
// packages/models/src/car/parts/*.ts, just inlined in plain JS. Once
// @ovium/models is published, swap this for a real
// `import { createCar } from "@ovium/models"` + a bundled build step.

function buildPreviewCar() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc81e3a, roughness: 0.4, metalness: 0.6 });
  const lower = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.66, 1.8), bodyMat);
  lower.position.y = 0.33;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.6, 1.66), bodyMat);
  cabin.position.set(-0.2, 0.93, 0);
  group.add(lower, cabin);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 20);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelPositions = [
    [1.3, 0.38, 0.95], [1.3, 0.38, -0.95],
    [-1.3, 0.38, 0.95], [-1.3, 0.38, -0.95],
  ];
  for (const [x, y, z] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(x, y, z);
    group.add(wheel);
  }

  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfff4d6, emissive: 0xfff4d6, emissiveIntensity: 1 });
  const lightGeo = new THREE.SphereGeometry(0.12, 12, 12);
  for (const z of [0.65, -0.65]) {
    const bulb = new THREE.Mesh(lightGeo, lightMat);
    bulb.position.set(2.05, 0.55, z);
    group.add(bulb);
    const point = new THREE.PointLight(0xfff4d6, 1, 6);
    point.position.copy(bulb.position);
    group.add(point);
  }

  return group;
}

function initHero() {
  const container = document.getElementById("hero-canvas");
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(4.2, 2.4, 4.6);
  camera.lookAt(0, 0.4, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x404040, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 6, 3);
  scene.add(key);

  const car = buildPreviewCar();
  car.position.y = -0.3;
  scene.add(car);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animate() {
    requestAnimationFrame(animate);
    if (!reducedMotion) {
      car.rotation.y += 0.0035;
    }
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

    for (const model of models) {
      const card = document.createElement("article");
      card.className = "model-card";
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
    }
  } catch (err) {
    countEl.textContent = "— couldn't load catalog";
    console.error("Failed to load catalog.json", err);
  }
}

initHero();
loadCatalog();
