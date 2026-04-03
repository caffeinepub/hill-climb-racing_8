# Hill Climb Racing

## Current State
- Game has a single vehicle (jeep/car) with fixed physics properties
- Upgrades panel has 4 upgrades: engine, suspension, tires, fuelTank (each up to level 5)
- VehicleShowcase component shows vehicle cards as static/decorative display only
- No vehicle selection mechanic — changing vehicle has no effect on gameplay
- Three stages: COUNTRYSIDE, DESERT, ARCTIC
- Coins and fuel system exist
- GameData/types do not include a vehicle type field
- gameEngine.ts creates a single car shape with fixed wheel offsets and dimensions

## Requested Changes (Diff)

### Add
- `VehicleType` enum/type: `JEEP | MOTORCYCLE | TRUCK | BUGGY | TANK`
- Each vehicle has unique stats: different width/height, wheel radii, wheel offsets, base traction multiplier, base suspension, max speed cap, weight, visual style
- Vehicle selection state in App.tsx (persisted to localStorage)
- A proper vehicle selector UI in VehicleShowcase: clickable cards with vehicle name, stats (speed, grip, fuel, weight bars), a "Selected" badge, and a locked/unlocked state
- Two vehicles unlocked by default (JEEP, MOTORCYCLE); others unlocked by spending coins
- Unlock cost displayed on locked vehicles
- The selected vehicle's stats flow into gameEngine createInitialCar and stepPhysics (dimensions, traction, suspension, wheel sizes)
- Per-vehicle upgrade storage: upgrades are stored per vehicle so each vehicle has its own upgrade progress
- Upgrade panel shows upgrades for the currently selected vehicle
- In-game vehicle drawing in HillClimbGame.tsx: each vehicle gets a distinct Canvas drawing (different shape, color, wheel size)
- Visual indicator in the game for current vehicle name

### Modify
- `types.ts`: add `VehicleType`, `VehicleConfig`, update `GameData` to include `vehicleType`, update `Upgrades` storage key pattern
- `gameEngine.ts`: `createInitialCar` and `initGameData` accept `VehicleConfig`; `stepPhysics` uses per-vehicle physics constants
- `HillClimbGame.tsx`: accept `selectedVehicle` prop, draw different vehicle shapes per type
- `VehicleShowcase.tsx`: transform from static display into interactive vehicle selector with unlock mechanic
- `Upgrades.tsx`: show which vehicle's upgrades are being shown
- `App.tsx`: add vehicle selection state, pass to game and upgrade panel

### Remove
- Nothing removed — only extended

## Implementation Plan
1. Update `types.ts` with VehicleType, VehicleConfig interface, per-vehicle stats, update GameData
2. Update `gameEngine.ts` to use VehicleConfig for car creation and physics
3. Update `HillClimbGame.tsx` to draw distinct vehicle shapes per type and accept selectedVehicle prop
4. Rewrite `VehicleShowcase.tsx` as interactive selector with unlock mechanic using coins
5. Update `Upgrades.tsx` to show current vehicle label
6. Update `App.tsx` with vehicle selection state, per-vehicle upgrade storage, coin deduction for unlock
