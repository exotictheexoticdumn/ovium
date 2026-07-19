export interface CarFrameOptions {
  frameColor?: string;
  panelColor?: string;
}

export interface CarWheelOptions {
  radius?: number;
  width?: number;
  color?: string;
  rimColor?: string;
}

export interface CarSuspensionOptions {
  shockColor?: string;
  coilColor?: string;
}

export interface CarLightOptions {
  on?: boolean;
  color?: string;
  intensity?: number;
}

export interface CarInteriorOptions {
  seatColor?: string;
  wheelColor?: string;
}

export interface CarOptions {
  frame?: CarFrameOptions;
  wheels?: CarWheelOptions;
  suspension?: CarSuspensionOptions;
  lights?: CarLightOptions;
  interior?: CarInteriorOptions;
}

export interface DriveInput {
  throttle: number; // -1..1
  steer: number; // -1..1
  brake: boolean;
}
