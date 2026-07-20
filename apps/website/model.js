import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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

// Builds the procedural buggy AND returns references to its key materials,
// so the customization panel on this page can actually recolor it live.
function buildPreviewBuggyWithMaterials() {
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
    const pointLights = [];
    for (const z of [-0.42, -0.14, 0.14, 0.42]) {
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(0.5, 1.5, z);
        group.add(bulb);
        const point = new THREE.PointLight(0xfff4d6, 1, 8);
        point.position.copy(bulb.position);
        group.add(point);
        pointLights.push(point);
    }

    return { group, materials: { tubeMat, panelMat, tireMat, rimMat, shockMat, coilMat, bulbMat }, pointLights };
}

function findMeshMaterials(node) {
    const materials = [];
    node.traverse((child) => {
        if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) materials.push(...child.material);
            else materials.push(child.material);
        }
    });
    return materials;
}

async function loadModelForSlug(slug) {
    if (slug === "car") {
        const { group, materials, pointLights } = buildPreviewBuggyWithMaterials();
        return {
            group,
            applyPatch(key, value) {
                const map = {
                    "frame.frameColor": () => materials.tubeMat.color.set(value),
                    "frame.panelColor": () => materials.panelMat.color.set(value),
                    "wheels.color": () => materials.tireMat.color.set(value),
                    "wheels.rimColor": () => materials.rimMat.color.set(value),
                    "suspension.shockColor": () => materials.shockMat.color.set(value),
                    "suspension.coilColor": () => materials.coilMat.color.set(value),
                    "lights.color": () => materials.bulbMat.color.set(value),
                    "lights.on": () => {
                        materials.bulbMat.emissiveIntensity = value ? 1 : 0;
                        for (const p of pointLights) p.intensity = value ? 1.2 : 0;
                    },
                };
                if (map[key]) map[key]();
            },
        };
    }

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(`${CDN_BASE}${slug}.glb`);
    const scene = gltf.scene;
    const body = scene.children.find((c) => c.name === "body");
    const wheelNames = ["wheel-front-left", "wheel-front-right", "wheel-back-left", "wheel-back-right"];
    const wheels = scene.children.filter((c) => wheelNames.includes(c.name));

    return {
        group: scene,
        applyPatch(key, value) {
            if (key === "bodyColor" && body) {
                for (const m of findMeshMaterials(body)) m.color.set(value);
            }
            if (key === "wheelColor") {
                for (const wheel of wheels) {
                    for (const m of findMeshMaterials(wheel)) m.color.set(value);
                }
            }
        },
    };
}

function initViewer() {
    const container = document.getElementById("model-canvas");
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x404040, 1.3));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(4, 6, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff8855, 0.35);
    rim.position.set(-4, 2, -4);
    scene.add(rim);

    let orbitAngle = -0.6;
    const orbitHeight = 2.2;
    const orbitRadius = 5.6;
    let isDragging = false;
    let lastPointerX = 0;
    let idleTimer = 0;

    function updateCamera() {
        camera.position.set(Math.cos(orbitAngle) * orbitRadius, orbitHeight, Math.sin(orbitAngle) * orbitRadius);
        camera.lookAt(0, 0.35, 0);
    }
    updateCamera();

    renderer.domElement.addEventListener("pointerdown", (e) => { isDragging = true; lastPointerX = e.clientX; idleTimer = 0; });
    window.addEventListener("pointerup", () => { isDragging = false; });
    window.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        orbitAngle += (e.clientX - lastPointerX) * 0.008;
        lastPointerX = e.clientX;
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let currentGroup = null;

    function setGroup(group) {
        currentGroup = group;
        group.position.y = -0.25;
        scene.add(group);
    }

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (!isDragging) {
            idleTimer += delta;
            if (idleTimer > 1.2 && !reducedMotion) orbitAngle += delta * 0.12;
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

    return { setGroup };
}

function formatSnippet(importName, values) {
    const entries = Object.entries(values);
    if (entries.length === 0) {
        return `<span class="kw">import</span> { ${importName} } <span class="kw">from</span> "@ovium/models";\n\n<span class="kw">const</span> model = <span class="kw">await</span> ${importName}();`;
    }
    const lines = entries.map(([key, val]) => {
        if (key.includes(".")) {
            return null; // nested paths get grouped below
        }
        return `  ${key}: ${typeof val === "string" ? `"${val}"` : val},`;
    }).filter(Boolean);

    // Group dotted keys (frame.frameColor -> frame: { frameColor: ... })
    const grouped = {};
    for (const [key, val] of entries) {
        if (!key.includes(".")) continue;
        const [group, prop] = key.split(".");
        grouped[group] = grouped[group] || {};
        grouped[group][prop] = val;
    }
    const groupLines = Object.entries(grouped).map(([group, props]) => {
        const inner = Object.entries(props).map(([p, v]) => `${p}: ${typeof v === "string" ? `"${v}"` : v}`).join(", ");
        return `  ${group}: { ${inner} },`;
    });

    const allLines = [...lines, ...groupLines].join("\n");
    return `<span class="kw">import</span> { ${importName} } <span class="kw">from</span> "@ovium/models";\n\n<span class="kw">const</span> model = <span class="kw">await</span> ${importName}({\n${allLines}\n});`;
}

async function main() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("model");
    const statusEl = document.getElementById("viewer-status");

    if (!slug) {
        document.getElementById("model-name").textContent = "No model specified";
        statusEl.textContent = "error";
        return;
    }

    const catalogRes = await fetch("./src/generated/catalog.json");
    const catalog = await catalogRes.json();
    const model = catalog.find((m) => m.slug === slug);

    if (!model) {
        document.getElementById("model-name").textContent = "Model not found";
        statusEl.textContent = "error";
        return;
    }

    document.title = `Ovium — ${model.name}`;
    document.getElementById("model-category").textContent = model.category;
    document.getElementById("model-name").textContent = model.name;
    document.getElementById("model-desc").textContent = model.description;
    document.getElementById("model-tags").innerHTML = model.tags.map((t) => `<span>#${t}</span>`).join("");

    const currentValues = {};
    for (const [key, prop] of Object.entries(model.editableProps || {})) {
        currentValues[key] = prop.default;
    }

    const codeEl = document.getElementById("code-snippet");
    function updateSnippet() {
        codeEl.innerHTML = formatSnippet(model.importName, currentValues);
    }
    updateSnippet();

    const viewer = initViewer();

    try {
        const { group, applyPatch } = await loadModelForSlug(slug);
        viewer.setGroup(group);
        statusEl.textContent = "ready";

        const controlsList = document.getElementById("controls-list");
        for (const [key, prop] of Object.entries(model.editableProps || {})) {
            const row = document.createElement("div");
            row.className = "control-row";

            if (prop.type === "color") {
                row.innerHTML = `<label>${key}</label><input type="color" value="${prop.default}" />`;
                row.querySelector("input").addEventListener("input", (e) => {
                    currentValues[key] = e.target.value;
                    applyPatch(key, e.target.value);
                    updateSnippet();
                });
            } else if (prop.type === "boolean") {
                row.innerHTML = `<label>${key}</label><input type="checkbox" ${prop.default ? "checked" : ""} />`;
                row.querySelector("input").addEventListener("change", (e) => {
                    currentValues[key] = e.target.checked;
                    applyPatch(key, e.target.checked);
                    updateSnippet();
                });
            } else {
                continue; // numeric props: no live control yet, but still shown in the snippet defaults
            }
            controlsList.appendChild(row);
        }
    } catch (err) {
        console.error(err);
        statusEl.textContent = "couldn't load model";
    }
}

main();
