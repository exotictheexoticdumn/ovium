export interface CarBodyOptions {
  color?: string;
  roughness?: number;
  metalness?: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface CarWheelOptions {
  radius?: number;
  width?: number;
  color?: string;
}

export interface CarDoorOptions {
  open?: boolean;
  color?: string;
}

export interface CarLightOptions {
  on?: boolean;
  color?: string;
  intensity?: number;
}

export interface CarInteriorOptions {
  seatColor?: string;
  dashColor?: string;
}

export interface CarOptions {
  body?: CarBodyOptions;
  wheels?: CarWheelOptions;
  doors?: CarDoorOptions;
  lights?: CarLightOptions;
  interior?: CarInteriorOptions;
}

export interface DriveInput {
  throttle: number; // -1..1
  steer: number; // -1..1
  brake: boolean;
}
