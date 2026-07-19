import { BoxGeometry, Mesh, MeshStandardMaterial, Group } from "three";
import type { CarInteriorOptions } from "../types.js";

export function buildInterior(options: CarInteriorOptions = {}) {
  const group = new Group();
  group.name = "interior";

  const seatMaterial = new MeshStandardMaterial({
    color: options.seatColor ?? "#1a1a1a",
    roughness: 0.8,
  });

  const dashMaterial = new MeshStandardMaterial({
    color: options.dashColor ?? "#222222",
    roughness: 0.6,
  });

  const seatGeometry = new BoxGeometry(0.5, 0.5, 0.5);
  const driverSeat = new Mesh(seatGeometry, seatMaterial);
  driverSeat.position.set(-0.5, 0.6, 0.4);
  driverSeat.name = "driverSeat";

  const passengerSeat = new Mesh(seatGeometry, seatMaterial);
  passengerSeat.position.set(-0.5, 0.6, -0.4);
  passengerSeat.name = "passengerSeat";

  const dash = new Mesh(new BoxGeometry(0.3, 0.6, 1.6), dashMaterial);
  dash.position.set(0.9, 0.75, 0);
  dash.name = "dashboard";

  group.add(driverSeat, passengerSeat, dash);

  return {
    group,
    seatMaterial,
    dashMaterial,
    setSeatColor(color: string) {
      seatMaterial.color.set(color);
    },
    setDashColor(color: string) {
      dashMaterial.color.set(color);
    },
  };
}

export type CarInterior = ReturnType<typeof buildInterior>;
