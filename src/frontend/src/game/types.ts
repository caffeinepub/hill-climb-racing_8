export type GameState = "MENU" | "PLAYING" | "GAME_OVER";

export type StageType = "COUNTRYSIDE" | "DESERT" | "ARCTIC";

export type VehicleType = "JEEP" | "MOTORCYCLE" | "TRUCK" | "BUGGY" | "TANK";

export interface VehicleConfig {
  type: VehicleType;
  name: string;
  unlockCost: number;
  width: number;
  height: number;
  frontWheelRadius: number;
  rearWheelRadius: number;
  frontWheelOffsetX: number;
  frontWheelOffsetY: number;
  rearWheelOffsetX: number;
  rearWheelOffsetY: number;
  tractionMult: number;
  suspensionMult: number;
  weightMult: number;
  maxSpeedMult: number;
  fuelEfficiency: number;
  bodyColor: string;
  accentColor: string;
  description: string;
}

export const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfig> = {
  JEEP: {
    type: "JEEP",
    name: "Jeep",
    unlockCost: 0,
    width: 80,
    height: 40,
    frontWheelRadius: 18,
    rearWheelRadius: 18,
    frontWheelOffsetX: 30,
    frontWheelOffsetY: 22,
    rearWheelOffsetX: -30,
    rearWheelOffsetY: 22,
    tractionMult: 1.0,
    suspensionMult: 1.0,
    weightMult: 1.0,
    maxSpeedMult: 1.0,
    fuelEfficiency: 1.0,
    bodyColor: "#6b7c3a",
    accentColor: "#8a9f4a",
    description: "Balanced all-terrain vehicle. Great for beginners.",
  },
  MOTORCYCLE: {
    type: "MOTORCYCLE",
    name: "Motorcycle",
    unlockCost: 0,
    width: 55,
    height: 30,
    frontWheelRadius: 15,
    rearWheelRadius: 15,
    frontWheelOffsetX: 22,
    frontWheelOffsetY: 18,
    rearWheelOffsetX: -22,
    rearWheelOffsetY: 18,
    tractionMult: 0.75,
    suspensionMult: 0.85,
    weightMult: 0.6,
    maxSpeedMult: 1.4,
    fuelEfficiency: 1.3,
    bodyColor: "#cc2020",
    accentColor: "#ff4444",
    description: "Blazing fast but hard to control. For experts.",
  },
  TRUCK: {
    type: "TRUCK",
    name: "Monster Truck",
    unlockCost: 300,
    width: 100,
    height: 50,
    frontWheelRadius: 22,
    rearWheelRadius: 22,
    frontWheelOffsetX: 38,
    frontWheelOffsetY: 28,
    rearWheelOffsetX: -38,
    rearWheelOffsetY: 28,
    tractionMult: 1.1,
    suspensionMult: 1.4,
    weightMult: 1.4,
    maxSpeedMult: 0.7,
    fuelEfficiency: 0.75,
    bodyColor: "#1a4a9a",
    accentColor: "#2a6acc",
    description: "Heavy beast with massive suspension. Slow but unstoppable.",
  },
  BUGGY: {
    type: "BUGGY",
    name: "Dune Buggy",
    unlockCost: 200,
    width: 70,
    height: 32,
    frontWheelRadius: 20,
    rearWheelRadius: 20,
    frontWheelOffsetX: 28,
    frontWheelOffsetY: 20,
    rearWheelOffsetX: -28,
    rearWheelOffsetY: 20,
    tractionMult: 1.3,
    suspensionMult: 1.2,
    weightMult: 0.9,
    maxSpeedMult: 1.1,
    fuelEfficiency: 1.1,
    bodyColor: "#d4a800",
    accentColor: "#f0c820",
    description: "High grip buggy built for rough terrain and speed.",
  },
  TANK: {
    type: "TANK",
    name: "Tank",
    unlockCost: 500,
    width: 110,
    height: 45,
    frontWheelRadius: 24,
    rearWheelRadius: 24,
    frontWheelOffsetX: 42,
    frontWheelOffsetY: 26,
    rearWheelOffsetX: -42,
    rearWheelOffsetY: 26,
    tractionMult: 1.6,
    suspensionMult: 1.1,
    weightMult: 1.8,
    maxSpeedMult: 0.5,
    fuelEfficiency: 0.6,
    bodyColor: "#2a3a18",
    accentColor: "#4a6028",
    description: "Indestructible war machine. Crushes all obstacles.",
  },
};

export interface Vec2 {
  x: number;
  y: number;
}

export interface Wheel {
  /** Position relative to chassis center */
  offsetX: number;
  offsetY: number;
  /** World position (computed) */
  worldX: number;
  worldY: number;
  /** Suspension compression */
  compression: number;
  radius: number;
  /** Rotational angle for visual spinning */
  rotation: number;
}

export interface Car {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  frontWheel: Wheel;
  rearWheel: Wheel;
  width: number;
  height: number;
}

export interface Coin {
  x: number;
  y: number;
  collected: boolean;
  bobOffset: number;
}

export interface FuelCan {
  x: number;
  y: number;
  collected: boolean;
}

export interface TerrainPoint {
  x: number;
  y: number;
}

export interface GameData {
  car: Car;
  terrain: TerrainPoint[];
  coins: Coin[];
  fuelCans: FuelCan[];
  cameraX: number;
  cameraY: number;
  distance: number;
  coinsCollected: number;
  fuel: number;
  maxFuel: number;
  gameState: GameState;
  stage: StageType;
  vehicleType: VehicleType;
  time: number;
  isGassing: boolean;
  isBraking: boolean;
}

export interface Upgrades {
  engine: number;
  suspension: number;
  tires: number;
  fuelTank: number;
}

export const UPGRADE_COSTS = [50, 100, 150, 200, 250];
export const MAX_UPGRADE_LEVEL = 5;

export interface ScoreEntry {
  playerName: string;
  distance: number;
  coins: number;
}
