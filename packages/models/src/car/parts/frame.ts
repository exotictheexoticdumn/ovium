import { Group, MeshStandardMaterial, Vector3 } from "three";
import { tubeBetween, buildMeshPanel, createMeshTexture, DoubleSide } from "./utils.js";
import type { CarFrameOptions } from "../types.js";

export function buildFrame(options: CarFrameOptions = {}) {
  const group = new Group();
  group.name = "frame";

  const tubeMaterial = new MeshStandardMaterial({
    color: options.frameColor ?? "#e8571f",
    roughness: 0.45,
    metalness: 0.55,
  });

  const panelMaterial = new MeshStandardMaterial({
    color: options.panelColor ?? "#f2f2f2",
    roughness: 0.5,
    metalness: 0.1,
  });

  const meshMaterial = new MeshStandardMaterial({
    color: "#c9c9c9",
    roughness: 0.6,
    metalness: 0.4,
    map: createMeshTexture(),
    transparent: true,
    alphaTest: 0.4,
    side: DoubleSide,
  });

  // Bottom chassis rail corners (where the wheels/suspension mount).
  const chassisFL = new Vector3(1.55, 0.4, 0.85);
  const chassisFR = new Vector3(1.55, 0.4, -0.85);
  const chassisRL = new Vector3(-1.55, 0.4, 0.85);
  const chassisRR = new Vector3(-1.55, 0.4, -0.85);

  // Cage base — narrower than the chassis, sits centered under the cockpit.
  const cageBaseFL = new Vector3(0.55, 0.4, 0.62);
  const cageBaseFR = new Vector3(0.55, 0.4, -0.62);
  const cageBaseRL = new Vector3(-0.65, 0.4, 0.62);
  const cageBaseRR = new Vector3(-0.65, 0.4, -0.62);

  // Cage top — the roll hoop the driver sits inside.
  const cageTopFL = new Vector3(0.55, 1.35, 0.55);
  const cageTopFR = new Vector3(0.55, 1.35, -0.55);
  const cageTopRL = new Vector3(-0.65, 1.35, 0.55);
  const cageTopRR = new Vector3(-0.65, 1.35, -0.55);

  const tubeRadius = 0.045;
  const bars: [Vector3, Vector3][] = [
    // Lower chassis rectangle (the belly frame the wheels hang off of)
    [chassisFL, chassisFR],
    [chassisRL, chassisRR],
    [chassisFL, chassisRL],
    [chassisFR, chassisRR],

    // Cage verticals (the four roll-hoop posts)
    [cageBaseFL, cageTopFL],
    [cageBaseFR, cageTopFR],
    [cageBaseRL, cageTopRL],
    [cageBaseRR, cageTopRR],

    // Cage top rectangle
    [cageTopFL, cageTopFR],
    [cageTopRL, cageTopRR],
    [cageTopFL, cageTopRL],
    [cageTopFR, cageTopRR],

    // Diagonal cross-bracing, front and rear of the cage (reads as "welded roll cage" from any angle)
    [cageBaseFL, cageTopFR],
    [cageBaseRL, cageTopRR],

    // Connect cage base down to the chassis rails, front and rear
    [cageBaseFL, chassisFL],
    [cageBaseFR, chassisFR],
    [cageBaseRL, chassisRL],
    [cageBaseRR, chassisRR],

    // Nose and tail extensions off the chassis corners (where lights/panels mount)
    [chassisFL, new Vector3(2.05, 0.55, 0.55)],
    [chassisFR, new Vector3(2.05, 0.55, -0.55)],
    [new Vector3(2.05, 0.55, 0.55), new Vector3(2.05, 0.55, -0.55)],
    [chassisRL, new Vector3(-2.0, 0.5, 0.55)],
    [chassisRR, new Vector3(-2.0, 0.5, -0.55)],
    [new Vector3(-2.0, 0.5, 0.55), new Vector3(-2.0, 0.5, -0.55)],
  ];

  for (const [a, b] of bars) {
    group.add(tubeBetween(a as Vector3, b as Vector3, tubeRadius, tubeMaterial));
  }

  // Front nose panel (the white belly-pan look from the reference)
  const nosePanel = buildMeshPanel(0.9, 0.55, panelMaterial);
  nosePanel.position.set(1.95, 0.55, 0);
  nosePanel.rotation.y = Math.PI / 2;
  nosePanel.name = "nosePanel";
  group.add(nosePanel);

  // Rear panel
  const rearPanel = buildMeshPanel(0.85, 0.5, panelMaterial);
  rearPanel.position.set(-1.9, 0.5, 0);
  rearPanel.rotation.y = Math.PI / 2;
  rearPanel.name = "rearPanel";
  group.add(rearPanel);

  // Mesh grille side panels between the cage posts (the diamond-mesh look)
  const leftMesh = buildMeshPanel(1.15, 0.85, meshMaterial);
  leftMesh.position.set(-0.05, 0.9, 0.63);
  leftMesh.name = "meshLeft";

  const rightMesh = buildMeshPanel(1.15, 0.85, meshMaterial);
  rightMesh.position.set(-0.05, 0.9, -0.63);
  rightMesh.rotation.y = Math.PI;
  rightMesh.name = "meshRight";

  group.add(leftMesh, rightMesh);

  return {
    group,
    tubeMaterial,
    panelMaterial,
    meshMaterial,
    mountPoints: { chassisFL, chassisFR, chassisRL, chassisRR },
    setFrameColor(color: string) {
      tubeMaterial.color.set(color);
    },
    setPanelColor(color: string) {
      panelMaterial.color.set(color);
    },
  };
}

export type CarFrame = ReturnType<typeof buildFrame>;
