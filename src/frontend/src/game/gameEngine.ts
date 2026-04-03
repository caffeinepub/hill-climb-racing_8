import type {
  Car,
  Coin,
  FuelCan,
  GameData,
  StageType,
  TerrainPoint,
  Upgrades,
  VehicleType,
} from "./types";
import { VEHICLE_CONFIGS } from "./types";

const TERRAIN_POINT_SPACING = 5;
const TERRAIN_TOTAL_LENGTH = 22000;
const GRAVITY = 0.55;
const BASE_TRACTION = 0.7;
const BASE_SUSPENSION_K = 0.9;
const BASE_SUSPENSION_DAMPING = 0.55;
const BASE_MAX_FUEL = 120;
const FUEL_CONSUMPTION_RATE = 0.018;
const CAR_DENSITY = 1.0;
// Base max speed in px/frame-equivalent; multiplied by vehicle config
const BASE_MAX_SPEED = 18;

export function generateTerrain(stage: StageType): TerrainPoint[] {
  const points: TerrainPoint[] = [];
  const count = Math.ceil(TERRAIN_TOTAL_LENGTH / TERRAIN_POINT_SPACING);
  const midY = 280;

  let amp1 = 0;
  let amp2 = 0;
  let amp3 = 0;
  let freq1 = 0;
  let freq2 = 0;
  let freq3 = 0;
  let growthFactor = 0;

  if (stage === "COUNTRYSIDE") {
    amp1 = 55;
    amp2 = 28;
    amp3 = 15;
    freq1 = 0.0025;
    freq2 = 0.007;
    freq3 = 0.018;
    growthFactor = 0.00008;
  } else if (stage === "DESERT") {
    amp1 = 90;
    amp2 = 45;
    amp3 = 20;
    freq1 = 0.003;
    freq2 = 0.009;
    freq3 = 0.022;
    growthFactor = 0.00012;
  } else if (stage === "ARCTIC") {
    amp1 = 120;
    amp2 = 60;
    amp3 = 30;
    freq1 = 0.004;
    freq2 = 0.011;
    freq3 = 0.028;
    growthFactor = 0.00015;
  }

  let prevY = midY;

  for (let i = 0; i < count; i++) {
    const wx = i * TERRAIN_POINT_SPACING;
    let terrainY: number;

    if (wx < 300) {
      terrainY = midY;
    } else {
      const distance = wx - 300;
      const growth = 1 + distance * growthFactor;
      const a1 = amp1 * growth;
      const a2 = amp2 * growth;
      const a3 = amp3 * growth;

      const raw =
        midY +
        a1 * Math.sin(wx * freq1 + 0.3) +
        a2 * Math.sin(wx * freq2 + 1.1) +
        a3 * Math.sin(wx * freq3 + 2.3);

      const blend = Math.min(1, (wx - 300) / 400);
      terrainY = midY + (raw - midY) * blend;
    }

    terrainY = Math.max(120, Math.min(460, terrainY));
    const maxDelta = 18;
    terrainY = Math.max(prevY - maxDelta, Math.min(prevY + maxDelta, terrainY));
    prevY = terrainY;

    points.push({ x: wx, y: terrainY });
  }

  return points;
}

export function getTerrainYAt(terrain: TerrainPoint[], worldX: number): number {
  if (terrain.length === 0) return 300;
  const idx = Math.floor(worldX / TERRAIN_POINT_SPACING);
  if (idx < 0) return terrain[0].y;
  if (idx >= terrain.length - 1) return terrain[terrain.length - 1].y;
  const t0 = terrain[idx];
  const t1 = terrain[idx + 1];
  const frac = (worldX - t0.x) / TERRAIN_POINT_SPACING;
  return t0.y + (t1.y - t0.y) * frac;
}

export function getTerrainNormalAt(
  terrain: TerrainPoint[],
  worldX: number,
): { nx: number; ny: number } {
  const dx = 10;
  const y0 = getTerrainYAt(terrain, worldX - dx);
  const y1 = getTerrainYAt(terrain, worldX + dx);
  const slope = (y1 - y0) / (2 * dx);
  const len = Math.sqrt(slope * slope + 1);
  return { nx: -slope / len, ny: -1 / len };
}

export function spawnCoins(terrain: TerrainPoint[]): Coin[] {
  const coins: Coin[] = [];
  for (let wx = 400; wx < TERRAIN_TOTAL_LENGTH - 200; wx += 280) {
    const ty = getTerrainYAt(terrain, wx);
    const clusterCount = Math.floor(Math.random() * 3) + 1;
    for (let c = 0; c < clusterCount; c++) {
      coins.push({
        x: wx + c * 45,
        y: ty - 40 - Math.random() * 20,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2,
      });
    }
  }
  return coins;
}

export function spawnFuelCans(terrain: TerrainPoint[]): FuelCan[] {
  const cans: FuelCan[] = [];
  for (let wx = 1200; wx < TERRAIN_TOTAL_LENGTH - 200; wx += 1500) {
    const ty = getTerrainYAt(terrain, wx);
    cans.push({ x: wx, y: ty - 35, collected: false });
  }
  return cans;
}

export function createInitialCar(
  _upgrades: Upgrades,
  vehicleType: VehicleType,
): Car {
  const cfg = VEHICLE_CONFIGS[vehicleType];
  return {
    x: 160,
    y: 180,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    width: cfg.width,
    height: cfg.height,
    frontWheel: {
      offsetX: cfg.frontWheelOffsetX,
      offsetY: cfg.frontWheelOffsetY,
      worldX: 160 + cfg.frontWheelOffsetX,
      worldY: 180 + cfg.frontWheelOffsetY,
      compression: 0,
      radius: cfg.frontWheelRadius,
      rotation: 0,
    },
    rearWheel: {
      offsetX: cfg.rearWheelOffsetX,
      offsetY: cfg.rearWheelOffsetY,
      worldX: 160 + cfg.rearWheelOffsetX,
      worldY: 180 + cfg.rearWheelOffsetY,
      compression: 0,
      radius: cfg.rearWheelRadius,
      rotation: 0,
    },
  };
}

function getSuspensionK(upgrades: Upgrades, vehicleType: VehicleType): number {
  const cfg = VEHICLE_CONFIGS[vehicleType];
  return (BASE_SUSPENSION_K + upgrades.suspension * 0.12) * cfg.suspensionMult;
}

function getSuspensionDamping(
  upgrades: Upgrades,
  vehicleType: VehicleType,
): number {
  const cfg = VEHICLE_CONFIGS[vehicleType];
  return (
    (BASE_SUSPENSION_DAMPING + upgrades.suspension * 0.06) * cfg.suspensionMult
  );
}

function getTraction(upgrades: Upgrades, vehicleType: VehicleType): number {
  const cfg = VEHICLE_CONFIGS[vehicleType];
  return (
    (BASE_TRACTION + upgrades.engine * 0.22 + upgrades.tires * 0.1) *
    cfg.tractionMult
  );
}

function getMaxFuel(upgrades: Upgrades, vehicleType: VehicleType): number {
  const cfg = VEHICLE_CONFIGS[vehicleType];
  return (BASE_MAX_FUEL + upgrades.fuelTank * 25) * cfg.fuelEfficiency;
}

export function getMaxFuelForUpgrades(
  upgrades: Upgrades,
  vehicleType: VehicleType,
): number {
  return getMaxFuel(upgrades, vehicleType);
}

export function initGameData(
  stage: StageType,
  upgrades: Upgrades,
  vehicleType: VehicleType = "JEEP",
): GameData {
  const terrain = generateTerrain(stage);
  const spawnY = getTerrainYAt(terrain, 160) - 70;
  const car = createInitialCar(upgrades, vehicleType);
  car.y = spawnY;
  car.frontWheel.worldY = spawnY + car.frontWheel.offsetY;
  car.rearWheel.worldY = spawnY + car.rearWheel.offsetY;

  return {
    car,
    terrain,
    coins: spawnCoins(terrain),
    fuelCans: spawnFuelCans(terrain),
    cameraX: 0,
    cameraY: 0,
    distance: 0,
    coinsCollected: 0,
    fuel: getMaxFuel(upgrades, vehicleType),
    maxFuel: getMaxFuel(upgrades, vehicleType),
    gameState: "PLAYING",
    stage,
    vehicleType,
    time: 0,
    isGassing: false,
    isBraking: false,
  };
}

export function stepPhysics(
  data: GameData,
  dt: number,
  upgrades: Upgrades,
): void {
  const { car, terrain } = data;
  const vehicleType = data.vehicleType;
  const vehicleCfg = VEHICLE_CONFIGS[vehicleType];
  const clampedDt = Math.min(dt, 0.05);

  const k = getSuspensionK(upgrades, vehicleType);
  const damping = getSuspensionDamping(upgrades, vehicleType);
  const traction = getTraction(upgrades, vehicleType);

  // Weight multiplier affects gravity response
  const effectiveGravity = GRAVITY * vehicleCfg.weightMult;

  let totalForceX = 0;
  let totalForceY = effectiveGravity * 60;
  let totalTorque = 0;

  const processWheel = (wheel: typeof car.frontWheel, isRear: boolean) => {
    const cosA = Math.cos(car.angle);
    const sinA = Math.sin(car.angle);
    const localX = wheel.offsetX;
    const localY = wheel.offsetY;
    wheel.worldX = car.x + cosA * localX - sinA * localY;
    wheel.worldY = car.y + sinA * localX + cosA * localY;

    const terrainY = getTerrainYAt(terrain, wheel.worldX);
    const penetration = wheel.worldY + wheel.radius - terrainY;

    if (penetration > 0) {
      const springForce = k * 80 * penetration;
      const relVelY = car.vy + car.angularVelocity * localX * cosA;
      const dampForce = damping * 60 * relVelY;
      const normalForce = Math.max(0, springForce - dampForce);

      const { nx, ny } = getTerrainNormalAt(terrain, wheel.worldX);
      totalForceX += normalForce * nx;
      totalForceY += normalForce * ny;

      const rx = wheel.worldX - car.x;
      const ry = wheel.worldY - car.y;
      totalTorque += rx * normalForce * ny - ry * normalForce * nx;

      wheel.compression = penetration;

      if (isRear && data.isGassing && data.fuel > 0) {
        // Max speed cap using vehicle multiplier
        const currentSpeed = Math.abs(car.vx);
        const maxSpeed = BASE_MAX_SPEED * vehicleCfg.maxSpeedMult;
        const speedFactor = currentSpeed > maxSpeed ? 0.1 : 1.0;
        const tractionForce = traction * 140 * speedFactor;
        const fuelUse =
          FUEL_CONSUMPTION_RATE *
          (1 / vehicleCfg.fuelEfficiency) *
          clampedDt *
          60;
        data.fuel = Math.max(0, data.fuel - fuelUse);
        totalForceX += tractionForce * cosA;
        totalForceY += tractionForce * sinA;
        totalTorque -= tractionForce * 3.5;
        wheel.rotation += (tractionForce / 30) * clampedDt * 60;
      } else if (isRear && data.isBraking) {
        const brakeForce = traction * 80;
        totalForceX -= brakeForce * cosA;
        totalForceY -= brakeForce * sinA;
        totalTorque += brakeForce * 2.5;
        wheel.rotation -= (brakeForce / 30) * clampedDt * 60;
      }

      const frictionForce = normalForce * 0.45;
      const sideVel = car.vx * -sinA + car.vy * cosA;
      totalForceX -= frictionForce * sideVel * -sinA;
      totalForceY -= frictionForce * sideVel * cosA;
    } else {
      wheel.compression = 0;
      if (isRear && data.isGassing && data.fuel > 0) {
        const airTraction = traction * 30;
        const fuelUse =
          FUEL_CONSUMPTION_RATE *
          0.5 *
          (1 / vehicleCfg.fuelEfficiency) *
          clampedDt *
          60;
        data.fuel = Math.max(0, data.fuel - fuelUse);
        totalForceX += airTraction * cosA;
        totalForceY += airTraction * sinA;
        totalTorque -= airTraction * 2;
        wheel.rotation += (airTraction / 30) * clampedDt * 60;
      }
    }
  };

  processWheel(car.rearWheel, true);
  processWheel(car.frontWheel, false);

  if (car.rearWheel.compression <= 0 && !data.isGassing && !data.isBraking) {
    const speed = Math.sqrt(car.vx * car.vx + car.vy * car.vy);
    car.rearWheel.rotation +=
      (speed / car.rearWheel.radius) * clampedDt * Math.sign(car.vx);
    car.frontWheel.rotation +=
      (speed / car.frontWheel.radius) * clampedDt * Math.sign(car.vx);
  }

  const angDamp = 0.012;
  totalTorque -= car.angularVelocity * angDamp * 3000;

  // Weight multiplier also affects mass
  const mass = 180 * CAR_DENSITY * vehicleCfg.weightMult;
  const inertia = mass * 900;

  car.vx += (totalForceX / mass) * clampedDt;
  car.vy += (totalForceY / mass) * clampedDt;
  car.angularVelocity += (totalTorque / inertia) * clampedDt;

  car.vx *= 0.985 ** (clampedDt * 60);
  car.vy *= 0.993 ** (clampedDt * 60);
  car.angularVelocity *= 0.975 ** (clampedDt * 60);

  // Hard speed cap
  const maxSpeed = BASE_MAX_SPEED * vehicleCfg.maxSpeedMult;
  const speed = Math.sqrt(car.vx * car.vx + car.vy * car.vy);
  if (speed > maxSpeed * 1.5) {
    car.vx = (car.vx / speed) * maxSpeed * 1.5;
    car.vy = (car.vy / speed) * maxSpeed * 1.5;
  }

  car.x += car.vx * clampedDt * 60;
  car.y += car.vy * clampedDt * 60;
  car.angle += car.angularVelocity * clampedDt * 60;

  const chassisTerrainY = getTerrainYAt(terrain, car.x);
  if (car.y + car.height / 2 > chassisTerrainY + 30) {
    car.y = chassisTerrainY - car.height / 2 + 10;
    car.vy *= -0.15;
  }

  const cosA2 = Math.cos(car.angle);
  const sinA2 = Math.sin(car.angle);
  car.frontWheel.worldX =
    car.x + cosA2 * car.frontWheel.offsetX - sinA2 * car.frontWheel.offsetY;
  car.frontWheel.worldY =
    car.y + sinA2 * car.frontWheel.offsetX + cosA2 * car.frontWheel.offsetY;
  car.rearWheel.worldX =
    car.x + cosA2 * car.rearWheel.offsetX - sinA2 * car.rearWheel.offsetY;
  car.rearWheel.worldY =
    car.y + sinA2 * car.rearWheel.offsetX + cosA2 * car.rearWheel.offsetY;

  data.distance = Math.max(data.distance, car.x - 160);
  data.time += clampedDt;

  const absAngle = Math.abs(data.car.angle % (2 * Math.PI));
  const normalizedAngle =
    absAngle > Math.PI ? 2 * Math.PI - absAngle : absAngle;
  if (normalizedAngle > (105 * Math.PI) / 180) {
    data.gameState = "GAME_OVER";
  }

  if (data.fuel <= 0) {
    data.isGassing = false;
  }

  const targetCamX = car.x - 200;
  const targetCamY = car.y - 200;
  data.cameraX += (targetCamX - data.cameraX) * 0.12;
  data.cameraY += (targetCamY - data.cameraY) * 0.08;

  for (const coin of data.coins) {
    if (coin.collected) continue;
    const dx = coin.x - car.x;
    const dy = coin.y - car.y;
    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      coin.collected = true;
      data.coinsCollected++;
    }
  }

  for (const can of data.fuelCans) {
    if (can.collected) continue;
    const dx = can.x - car.x;
    const dy = can.y - car.y;
    if (Math.sqrt(dx * dx + dy * dy) < 45) {
      can.collected = true;
      data.fuel = Math.min(data.maxFuel, data.fuel + data.maxFuel * 0.6);
    }
  }
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  data: GameData,
  canvasW: number,
  canvasH: number,
  time: number,
): void {
  const { car, terrain, cameraX, cameraY, coins, fuelCans } = data;

  ctx.clearRect(0, 0, canvasW, canvasH);

  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasH);
  if (data.stage === "ARCTIC") {
    skyGrad.addColorStop(0, "#1a3050");
    skyGrad.addColorStop(0.6, "#4a7090");
    skyGrad.addColorStop(1, "#8ab0c0");
  } else if (data.stage === "DESERT") {
    skyGrad.addColorStop(0, "#2a1a05");
    skyGrad.addColorStop(0.5, "#8a4510");
    skyGrad.addColorStop(1, "#d08020");
  } else {
    skyGrad.addColorStop(0, "#0a1830");
    skyGrad.addColorStop(0.5, "#1a3a5a");
    skyGrad.addColorStop(1, "#2a6a4a");
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.save();
  ctx.translate(-cameraX * 0.25, -cameraY * 0.15);
  const mountainColor =
    data.stage === "ARCTIC"
      ? "rgba(80,110,140,0.4)"
      : data.stage === "DESERT"
        ? "rgba(120,80,30,0.4)"
        : "rgba(20,60,40,0.4)";
  ctx.fillStyle = mountainColor;
  for (let mx = -500; mx < cameraX * 0.25 + canvasW + 600; mx += 200) {
    const mh = 80 + Math.abs(Math.sin(mx * 0.005 + 1.3)) * 120;
    ctx.beginPath();
    ctx.moveTo(mx, canvasH);
    ctx.lineTo(mx + 100, canvasH - mh);
    ctx.lineTo(mx + 200, canvasH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  const startX = Math.max(0, Math.floor(cameraX / TERRAIN_POINT_SPACING) - 2);
  const endX = Math.min(
    terrain.length - 1,
    Math.ceil((cameraX + canvasW) / TERRAIN_POINT_SPACING) + 2,
  );

  if (endX > startX) {
    ctx.beginPath();
    ctx.moveTo(terrain[startX].x, canvasH + cameraY + 200);
    for (let i = startX; i <= endX; i++) {
      ctx.lineTo(terrain[i].x, terrain[i].y);
    }
    ctx.lineTo(terrain[endX].x, canvasH + cameraY + 200);
    ctx.closePath();

    const terrainGrad = ctx.createLinearGradient(
      0,
      200,
      0,
      canvasH + cameraY + 200,
    );
    if (data.stage === "COUNTRYSIDE") {
      terrainGrad.addColorStop(0, "#3a7030");
      terrainGrad.addColorStop(0.15, "#2a5020");
      terrainGrad.addColorStop(1, "#1a2510");
    } else if (data.stage === "DESERT") {
      terrainGrad.addColorStop(0, "#c8902a");
      terrainGrad.addColorStop(0.15, "#9a6818");
      terrainGrad.addColorStop(1, "#5a3808");
    } else {
      terrainGrad.addColorStop(0, "#d0e8f0");
      terrainGrad.addColorStop(0.15, "#8090a0");
      terrainGrad.addColorStop(1, "#404858");
    }
    ctx.fillStyle = terrainGrad;
    ctx.fill();

    ctx.beginPath();
    for (let i = startX; i <= endX; i++) {
      if (i === startX) ctx.moveTo(terrain[i].x, terrain[i].y);
      else ctx.lineTo(terrain[i].x, terrain[i].y);
    }
    ctx.strokeStyle =
      data.stage === "ARCTIC"
        ? "rgba(220,240,255,0.8)"
        : data.stage === "DESERT"
          ? "rgba(200,160,60,0.8)"
          : "rgba(80,160,60,0.8)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  for (const coin of coins) {
    if (coin.collected) continue;
    if (coin.x < cameraX - 60 || coin.x > cameraX + canvasW + 60) continue;
    const bob = Math.sin(time * 3 + coin.bobOffset) * 3;
    ctx.save();
    ctx.translate(coin.x, coin.y + bob);
    const coinGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 11);
    coinGrad.addColorStop(0, "#ffe060");
    coinGrad.addColorStop(0.6, "#f0a000");
    coinGrad.addColorStop(1, "#c07000");
    ctx.fillStyle = coinGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#80500a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#80500a";
    ctx.font = "bold 9px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", 0, 1);
    ctx.restore();
  }

  for (const can of fuelCans) {
    if (can.collected) continue;
    if (can.x < cameraX - 60 || can.x > cameraX + canvasW + 60) continue;
    ctx.save();
    ctx.translate(can.x, can.y);
    ctx.fillStyle = "#cc2020";
    ctx.beginPath();
    ctx.roundRect(-12, -18, 24, 36, 4);
    ctx.fill();
    ctx.fillStyle = "#ff4040";
    ctx.beginPath();
    ctx.roundRect(-10, -16, 10, 14, 2);
    ctx.fill();
    ctx.fillStyle = "#cc2020";
    ctx.beginPath();
    ctx.roundRect(-2, -22, 8, 6, 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 8px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAS", 0, 6);
    ctx.restore();
  }

  renderCar(ctx, car, data.vehicleType);

  ctx.restore();

  renderHUD(ctx, data, canvasW, canvasH, time);
}

function renderCar(
  ctx: CanvasRenderingContext2D,
  car: Car,
  vehicleType: VehicleType,
): void {
  const cfg = VEHICLE_CONFIGS[vehicleType];

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  const hw = car.width / 2;
  const hh = car.height / 2;

  if (vehicleType === "MOTORCYCLE") {
    // Slim elongated body
    const bikeGrad = ctx.createLinearGradient(0, -hh, 0, hh);
    bikeGrad.addColorStop(0, "#ff4444");
    bikeGrad.addColorStop(0.5, "#cc2020");
    bikeGrad.addColorStop(1, "#881010");
    ctx.fillStyle = bikeGrad;
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, car.width, car.height, 4);
    ctx.fill();
    // Rider silhouette
    ctx.fillStyle = "#220808";
    ctx.beginPath();
    ctx.roundRect(-4, -hh - 16, 14, 16, [4, 4, 0, 0]);
    ctx.fill();
    // Windshield
    ctx.fillStyle = "rgba(150,220,255,0.6)";
    ctx.beginPath();
    ctx.roundRect(-2, -hh - 14, 10, 10, 2);
    ctx.fill();
    // Accent stripe
    ctx.strokeStyle = "rgba(255,120,120,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-hw + 4, 0);
    ctx.lineTo(hw - 4, 0);
    ctx.stroke();
  } else if (vehicleType === "TRUCK") {
    // Wide body
    const truckGrad = ctx.createLinearGradient(0, -hh, 0, hh);
    truckGrad.addColorStop(0, "#2a6acc");
    truckGrad.addColorStop(0.5, "#1a4a9a");
    truckGrad.addColorStop(1, "#0a2a5a");
    ctx.fillStyle = truckGrad;
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, car.width, car.height, 6);
    ctx.fill();
    // Cab section
    ctx.fillStyle = "#1a3a78";
    ctx.beginPath();
    ctx.roundRect(hw - 38, -hh - 22, 38, 22, [5, 5, 0, 0]);
    ctx.fill();
    // Windshield
    ctx.fillStyle = "rgba(150,220,255,0.7)";
    ctx.beginPath();
    ctx.roundRect(hw - 35, -hh - 18, 30, 14, 2);
    ctx.fill();
    // Grill
    ctx.fillStyle = "#4a6aaa";
    ctx.beginPath();
    ctx.roundRect(hw - 4, -hh + 4, 6, car.height - 8, 2);
    ctx.fill();
    // Stripe
    ctx.strokeStyle = "rgba(80,140,255,0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-hw + 6, -4);
    ctx.lineTo(hw - 40, -4);
    ctx.stroke();
  } else if (vehicleType === "BUGGY") {
    // Low wide body
    const buggyGrad = ctx.createLinearGradient(0, -hh, 0, hh);
    buggyGrad.addColorStop(0, "#f0c820");
    buggyGrad.addColorStop(0.5, "#d4a800");
    buggyGrad.addColorStop(1, "#906800");
    ctx.fillStyle = buggyGrad;
    // Slightly trapezoidal body
    ctx.beginPath();
    ctx.moveTo(-hw + 8, -hh);
    ctx.lineTo(hw - 8, -hh);
    ctx.lineTo(hw, hh);
    ctx.lineTo(-hw, hh);
    ctx.closePath();
    ctx.fill();
    // Roll cage
    ctx.strokeStyle = "rgba(200,170,0,0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-hw + 12, -hh);
    ctx.lineTo(-hw + 12, -hh - 14);
    ctx.lineTo(hw - 12, -hh - 14);
    ctx.lineTo(hw - 12, -hh);
    ctx.stroke();
    // Windshield
    ctx.fillStyle = "rgba(150,220,255,0.55)";
    ctx.beginPath();
    ctx.roundRect(-8, -hh - 12, 28, 10, 2);
    ctx.fill();
  } else if (vehicleType === "TANK") {
    // Flat hull
    const tankGrad = ctx.createLinearGradient(0, -hh, 0, hh);
    tankGrad.addColorStop(0, "#4a6028");
    tankGrad.addColorStop(0.5, "#2a3a18");
    tankGrad.addColorStop(1, "#1a2210");
    ctx.fillStyle = tankGrad;
    // Main hull
    ctx.beginPath();
    ctx.roundRect(-hw, -hh + 6, car.width, car.height - 6, 3);
    ctx.fill();
    // Turret on top
    ctx.fillStyle = "#3a5020";
    ctx.beginPath();
    ctx.roundRect(-18, -hh - 12, 44, 18, [4, 4, 0, 0]);
    ctx.fill();
    // Cannon barrel
    ctx.fillStyle = "#2a3a18";
    ctx.beginPath();
    ctx.roundRect(20, -hh - 8, 26, 6, 2);
    ctx.fill();
    // Armor plates
    ctx.strokeStyle = "rgba(80,100,40,0.7)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-hw + 10 + i * 28, -hh + 8);
      ctx.lineTo(-hw + 10 + i * 28, hh - 4);
      ctx.stroke();
    }
  } else {
    // JEEP — default
    const jeepGrad = ctx.createLinearGradient(0, -hh - 10, 0, hh);
    jeepGrad.addColorStop(0, cfg.accentColor);
    jeepGrad.addColorStop(0.4, cfg.bodyColor);
    jeepGrad.addColorStop(1, "#3a4518");
    ctx.fillStyle = jeepGrad;
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, car.width, car.height, 6);
    ctx.fill();
    // Cab top
    ctx.fillStyle = "#4a5520";
    ctx.beginPath();
    ctx.roundRect(-8, -hh - 18, 38, 18, [4, 4, 0, 0]);
    ctx.fill();
    // Windshield
    ctx.fillStyle = "rgba(150,220,255,0.7)";
    ctx.beginPath();
    ctx.roundRect(-4, -hh - 15, 30, 13, 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.roundRect(-3, -hh - 14, 12, 5, 1);
    ctx.fill();
    // Body stripe
    ctx.strokeStyle = "rgba(160,200,80,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-hw + 5, 0);
    ctx.lineTo(hw - 5, 0);
    ctx.stroke();
  }

  ctx.restore();

  // Draw wheels with vehicle-appropriate style
  for (const wheel of [car.frontWheel, car.rearWheel]) {
    const ax =
      car.x +
      Math.cos(car.angle) * wheel.offsetX -
      Math.sin(car.angle) * wheel.offsetY;
    const ay =
      car.y +
      Math.sin(car.angle) * wheel.offsetX +
      Math.cos(car.angle) * wheel.offsetY;

    // Suspension arm
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(wheel.worldX, wheel.worldY);
    ctx.strokeStyle = "rgba(200,200,200,0.7)";
    ctx.lineWidth = vehicleType === "TANK" ? 5 : 3;
    ctx.stroke();

    ctx.save();
    ctx.translate(wheel.worldX, wheel.worldY);
    ctx.rotate(wheel.rotation);

    if (vehicleType === "TANK") {
      // Tank uses track-style wide wheel
      ctx.beginPath();
      ctx.arc(0, 0, wheel.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a10";
      ctx.fill();
      ctx.strokeStyle = "#3a3a20";
      ctx.lineWidth = 4;
      ctx.stroke();
      // Track pads
      for (let t = 0; t < 8; t++) {
        const ta = (t / 8) * Math.PI * 2;
        ctx.save();
        ctx.rotate(ta);
        ctx.fillStyle = "#2a2a18";
        ctx.fillRect(wheel.radius - 6, -4, 6, 8);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, wheel.radius - 8, 0, Math.PI * 2);
      ctx.fillStyle = "#303820";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#606840";
      ctx.fill();
    } else {
      // Standard wheel with tread
      ctx.beginPath();
      ctx.arc(0, 0, wheel.radius, 0, Math.PI * 2);
      ctx.fillStyle = vehicleType === "MOTORCYCLE" ? "#111" : "#1a1a1a";
      ctx.fill();
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Tread marks
      const treadCount =
        vehicleType === "BUGGY" || vehicleType === "TRUCK" ? 8 : 6;
      for (let t = 0; t < treadCount; t++) {
        const ta = (t / treadCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(
          Math.cos(ta) * (wheel.radius - 5),
          Math.sin(ta) * (wheel.radius - 5),
        );
        ctx.lineTo(Math.cos(ta) * wheel.radius, Math.sin(ta) * wheel.radius);
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Rim - vehicle specific color
      const rimColor =
        vehicleType === "MOTORCYCLE"
          ? "#d4d4d4"
          : vehicleType === "TRUCK"
            ? "#c0c8d8"
            : vehicleType === "BUGGY"
              ? "#e0c030"
              : "#c8c8c8";
      ctx.beginPath();
      ctx.arc(0, 0, wheel.radius - 5, 0, Math.PI * 2);
      ctx.fillStyle = rimColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#888";
      ctx.fill();

      // Spokes
      const spokeCount = vehicleType === "MOTORCYCLE" ? 6 : 4;
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = vehicleType === "MOTORCYCLE" ? 1 : 2;
      for (let s = 0; s < spokeCount; s++) {
        const sa = (s / spokeCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * 4, Math.sin(sa) * 4);
        ctx.lineTo(
          Math.cos(sa) * (wheel.radius - 5),
          Math.sin(sa) * (wheel.radius - 5),
        );
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

function renderHUD(
  ctx: CanvasRenderingContext2D,
  data: GameData,
  canvasW: number,
  canvasH: number,
  time: number,
): void {
  ctx.fillStyle = "rgba(5,15,30,0.75)";
  ctx.beginPath();
  ctx.roundRect(10, 10, canvasW - 20, 44, 6);
  ctx.fill();

  const distM = Math.floor(data.distance / 10);
  ctx.fillStyle = "#a0b0c0";
  ctx.font = "11px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("DIST", 20, 24);
  ctx.fillStyle = "#ff9030";
  ctx.font = "bold 16px Arial";
  ctx.fillText(`${distM}m`, 20, 40);

  // Vehicle label in HUD
  const vcfg = VEHICLE_CONFIGS[data.vehicleType];
  ctx.fillStyle = "rgba(200,200,200,0.6)";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.fillText(vcfg.name.toUpperCase(), canvasW / 2, 24);

  const coinX = 120;
  ctx.fillStyle = "#f0c020";
  ctx.beginPath();
  ctx.arc(coinX, 32, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#805010";
  ctx.font = "bold 7px Arial";
  ctx.textAlign = "center";
  ctx.fillText("$", coinX, 33);
  ctx.fillStyle = "#f0c020";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`${data.coinsCollected}`, coinX + 14, 32);

  const fuelBarX = canvasW - 170;
  const fuelBarW = 140;
  const fuelBarH = 12;
  const fuelBarY = 26;
  ctx.fillStyle = "#a0b0c0";
  ctx.font = "10px Arial";
  ctx.textAlign = "left";
  ctx.fillText("FUEL", fuelBarX, fuelBarY - 6);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.roundRect(fuelBarX, fuelBarY, fuelBarW, fuelBarH, 3);
  ctx.fill();
  const fuelPct = data.fuel / data.maxFuel;
  const fuelColor =
    fuelPct > 0.5 ? "#20c050" : fuelPct > 0.25 ? "#f0a020" : "#e03020";
  ctx.fillStyle = fuelColor;
  ctx.beginPath();
  ctx.roundRect(fuelBarX, fuelBarY, fuelBarW * fuelPct, fuelBarH, 3);
  ctx.fill();

  const btnY = canvasH - 58;
  const btnH = 48;
  const btnW = 90;

  const brakeX = 20;
  ctx.fillStyle = data.isBraking
    ? "rgba(255,90,0,0.85)"
    : "rgba(30,60,120,0.75)";
  ctx.beginPath();
  ctx.roundRect(brakeX, btnY, btnW, btnH, 10);
  ctx.fill();
  ctx.strokeStyle = data.isBraking ? "#ff7a1a" : "rgba(100,150,255,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("◀ BRAKE", brakeX + btnW / 2, btnY + btnH / 2);

  const gasX = canvasW - btnW - 20;
  ctx.fillStyle =
    data.isGassing && data.fuel > 0
      ? "rgba(255,120,0,0.85)"
      : "rgba(30,60,120,0.75)";
  ctx.beginPath();
  ctx.roundRect(gasX, btnY, btnW, btnH, 10);
  ctx.fill();
  ctx.strokeStyle = data.isGassing ? "#ff7a1a" : "rgba(100,150,255,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = data.fuel <= 0 ? "#888" : "white";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    data.fuel <= 0 ? "NO FUEL" : "GAS ▶",
    gasX + btnW / 2,
    btnY + btnH / 2,
  );

  const absAngle = Math.abs(data.car.angle % (2 * Math.PI));
  const normalized = absAngle > Math.PI ? 2 * Math.PI - absAngle : absAngle;
  if (normalized > (60 * Math.PI) / 180) {
    const alpha = 0.3 + 0.4 * Math.abs(Math.sin(time * 4));
    ctx.fillStyle = `rgba(255,60,30,${alpha})`;
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚠ DANGER - FLIPPING!", canvasW / 2, canvasH / 2 - 30);
  }

  if (data.isGassing && data.fuel > 0) {
    const px = data.car.x - data.cameraX - Math.cos(data.car.angle) * 45;
    const py =
      data.car.y -
      data.cameraY +
      Math.sin(data.car.angle) * 10 +
      data.car.height / 2;
    for (let p = 0; p < 3; p++) {
      const pa = time * 10 + p * 2;
      ctx.fillStyle = `rgba(200,150,50,${0.3 - p * 0.08})`;
      ctx.beginPath();
      ctx.arc(
        px - p * 8 + Math.sin(pa) * 3,
        py + Math.cos(pa) * 3,
        5 - p,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}
