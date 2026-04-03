import type React from "react";
import type { VehicleType } from "../game/types";
import { VEHICLE_CONFIGS } from "../game/types";

interface VehicleShowcaseProps {
  selectedVehicle: VehicleType;
  unlockedVehicles: VehicleType[];
  totalCoins: number;
  onSelectVehicle: (v: VehicleType) => void;
  onUnlockVehicle: (v: VehicleType) => void;
}

// Stat values per vehicle (1-5 scale)
const VEHICLE_STATS: Record<
  VehicleType,
  { speed: number; grip: number; suspension: number; fuel: number }
> = {
  JEEP: { speed: 3, grip: 3, suspension: 3, fuel: 3 },
  MOTORCYCLE: { speed: 5, grip: 2, suspension: 2, fuel: 5 },
  TRUCK: { speed: 2, grip: 3, suspension: 5, fuel: 1 },
  BUGGY: { speed: 4, grip: 4, suspension: 4, fuel: 4 },
  TANK: { speed: 1, grip: 5, suspension: 3, fuel: 1 },
};

const VEHICLE_ORDER: VehicleType[] = [
  "JEEP",
  "MOTORCYCLE",
  "BUGGY",
  "TRUCK",
  "TANK",
];

function StatBar({
  label,
  value,
  color,
}: { label: string; value: number; color: string }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}
    >
      <span
        style={{
          fontSize: 9,
          color: "oklch(0.48 0.016 232)",
          fontFamily: "BricolageGrotesque, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.06em",
          minWidth: 32,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 5,
          background: "oklch(0.20 0.038 240)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(value / 5) * 100}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 9,
          color: "oklch(0.55 0.018 232)",
          fontFamily: "BricolageGrotesque, sans-serif",
          fontWeight: 700,
          minWidth: 8,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function VehicleSVG({
  type,
  scale = 1,
}: { type: VehicleType; scale?: number }) {
  const w = 80 * scale;
  const h = 48 * scale;

  const vehicleShapes: Record<VehicleType, React.ReactNode> = {
    JEEP: (
      <>
        <rect x="4" y="14" width="56" height="22" rx="4" fill="#6b7c3a" />
        <rect x="20" y="5" width="30" height="13" rx="3" fill="#4a5520" />
        <rect
          x="22"
          y="7"
          width="24"
          height="9"
          rx="2"
          fill="rgba(150,220,255,0.6)"
        />
        <circle
          cx="15"
          cy="36"
          r="9"
          fill="#1a1a1a"
          stroke="#c8c8c8"
          strokeWidth="2"
        />
        <circle cx="15" cy="36" r="4" fill="#c8c8c8" />
        <circle
          cx="49"
          cy="36"
          r="9"
          fill="#1a1a1a"
          stroke="#c8c8c8"
          strokeWidth="2"
        />
        <circle cx="49" cy="36" r="4" fill="#c8c8c8" />
        <line
          x1="8"
          y1="26"
          x2="56"
          y2="26"
          stroke="rgba(160,200,80,0.5)"
          strokeWidth="1.5"
        />
      </>
    ),
    MOTORCYCLE: (
      <>
        <rect x="10" y="16" width="44" height="16" rx="4" fill="#cc2020" />
        <rect x="22" y="5" width="16" height="13" rx="3" fill="#991515" />
        <rect
          x="23"
          y="6"
          width="12"
          height="9"
          rx="2"
          fill="rgba(150,220,255,0.6)"
        />
        <circle
          cx="13"
          cy="34"
          r="8"
          fill="#111"
          stroke="#d4d4d4"
          strokeWidth="2"
        />
        <circle cx="13" cy="34" r="3" fill="#d4d4d4" />
        <circle
          cx="51"
          cy="34"
          r="8"
          fill="#111"
          stroke="#d4d4d4"
          strokeWidth="2"
        />
        <circle cx="51" cy="34" r="3" fill="#d4d4d4" />
        <line
          x1="13"
          y1="26"
          x2="51"
          y2="26"
          stroke="rgba(255,120,120,0.7)"
          strokeWidth="1.5"
        />
      </>
    ),
    BUGGY: (
      <>
        <polygon points="10,14 54,14 58,32 6,32" fill="#d4a800" />
        <line x1="12" y1="14" x2="12" y2="3" stroke="#c49000" strokeWidth="2" />
        <line x1="52" y1="14" x2="52" y2="3" stroke="#c49000" strokeWidth="2" />
        <line x1="12" y1="3" x2="52" y2="3" stroke="#c49000" strokeWidth="2" />
        <rect
          x="18"
          y="4"
          width="20"
          height="9"
          rx="2"
          fill="rgba(150,220,255,0.5)"
        />
        <circle
          cx="14"
          cy="34"
          r="11"
          fill="#1a1a1a"
          stroke="#e0c030"
          strokeWidth="2"
        />
        <circle cx="14" cy="34" r="5" fill="#e0c030" />
        <circle
          cx="50"
          cy="34"
          r="11"
          fill="#1a1a1a"
          stroke="#e0c030"
          strokeWidth="2"
        />
        <circle cx="50" cy="34" r="5" fill="#e0c030" />
      </>
    ),
    TRUCK: (
      <>
        <rect x="2" y="10" width="62" height="26" rx="4" fill="#1a4a9a" />
        <rect x="36" y="1" width="28" height="15" rx="3" fill="#1a3a78" />
        <rect
          x="38"
          y="3"
          width="24"
          height="10"
          rx="2"
          fill="rgba(150,220,255,0.65)"
        />
        <rect x="62" y="14" width="4" height="16" rx="1" fill="#4a6aaa" />
        <circle
          cx="14"
          cy="38"
          r="10"
          fill="#1a1a1a"
          stroke="#c0c8d8"
          strokeWidth="2"
        />
        <circle cx="14" cy="38" r="4" fill="#c0c8d8" />
        <circle
          cx="50"
          cy="38"
          r="10"
          fill="#1a1a1a"
          stroke="#c0c8d8"
          strokeWidth="2"
        />
        <circle cx="50" cy="38" r="4" fill="#c0c8d8" />
      </>
    ),
    TANK: (
      <>
        <rect x="2" y="16" width="68" height="20" rx="3" fill="#2a3a18" />
        <rect x="14" y="5" width="36" height="14" rx="3" fill="#3a5020" />
        <rect x="44" y="9" width="22" height="5" rx="2" fill="#2a3a18" />
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={16 + i * 20}
            y1="18"
            x2={16 + i * 20}
            y2="34"
            stroke="rgba(80,100,40,0.7)"
            strokeWidth="1.5"
          />
        ))}
        <rect x="2" y="30" width="68" height="10" rx="2" fill="#1a2210" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={10 + i * 13}
            cy="35"
            r="5"
            fill="#303820"
            stroke="#2a2a18"
            strokeWidth="1"
          />
        ))}
      </>
    ),
  };

  return (
    <svg
      width={w}
      height={h}
      role="img"
      aria-label={`${type} vehicle illustration`}
      viewBox="0 0 64 48"
      style={{ overflow: "visible" }}
    >
      {vehicleShapes[type]}
    </svg>
  );
}

export default function VehicleShowcase({
  selectedVehicle,
  unlockedVehicles,
  totalCoins,
  onSelectVehicle,
  onUnlockVehicle,
}: VehicleShowcaseProps) {
  return (
    <div className="h-full flex flex-col" data-ocid="vehicles.panel">
      <h3
        style={{
          fontFamily: "BricolageGrotesque, sans-serif",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "oklch(0.55 0.018 232)",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: 14,
            background: "oklch(0.72 0.21 48)",
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        Vehicles
      </h3>

      <div className="flex flex-col gap-2 flex-1">
        {VEHICLE_ORDER.map((vType, i) => {
          const cfg = VEHICLE_CONFIGS[vType];
          const stats = VEHICLE_STATS[vType];
          const isUnlocked = unlockedVehicles.includes(vType);
          const isSelected = selectedVehicle === vType;
          const canAfford = totalCoins >= cfg.unlockCost;

          return (
            <div
              key={vType}
              data-ocid={`vehicles.item.${i + 1}`}
              onClick={() => {
                if (isUnlocked) onSelectVehicle(vType);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (isUnlocked) onSelectVehicle(vType);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 8,
                border: isSelected
                  ? `1.5px solid ${cfg.accentColor}88`
                  : isUnlocked
                    ? "1.5px solid oklch(0.22 0.040 238 / 0.5)"
                    : "1.5px solid oklch(0.18 0.030 238 / 0.5)",
                background: isSelected
                  ? `${cfg.bodyColor}20`
                  : isUnlocked
                    ? "oklch(0.14 0.040 240 / 0.6)"
                    : "oklch(0.11 0.030 240 / 0.5)",
                cursor: isUnlocked ? "pointer" : "default",
                opacity: isUnlocked ? 1 : 0.65,
                boxShadow: isSelected
                  ? `0 0 16px ${cfg.bodyColor}30, inset 0 0 8px ${cfg.bodyColor}10`
                  : "none",
                transition:
                  "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Selected glow accent line */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: cfg.accentColor,
                    borderRadius: "3px 0 0 3px",
                    boxShadow: `0 0 8px ${cfg.accentColor}`,
                  }}
                />
              )}

              {/* Vehicle SVG illustration */}
              <div
                style={{
                  flexShrink: 0,
                  width: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  filter: isUnlocked ? "none" : "grayscale(1) brightness(0.5)",
                }}
              >
                <VehicleSVG type={vType} scale={0.7} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: isSelected
                        ? "oklch(0.97 0.005 220)"
                        : isUnlocked
                          ? "oklch(0.88 0.010 225)"
                          : "oklch(0.55 0.018 232)",
                      fontFamily: "BricolageGrotesque, sans-serif",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {cfg.name}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        fontSize: 8,
                        background: "oklch(0.45 0.18 148)",
                        color: "oklch(0.97 0.005 220)",
                        borderRadius: 3,
                        padding: "2px 6px",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        fontFamily: "BricolageGrotesque, sans-serif",
                      }}
                      data-ocid={`vehicles.item.${i + 1}`}
                    >
                      SELECTED
                    </span>
                  )}
                  {!isUnlocked && (
                    <span
                      style={{
                        fontSize: 8,
                        background: "oklch(0.22 0.030 238)",
                        color: "oklch(0.48 0.018 232)",
                        borderRadius: 3,
                        padding: "2px 6px",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        fontFamily: "BricolageGrotesque, sans-serif",
                      }}
                    >
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Stats */}
                <StatBar
                  label="SPD"
                  value={stats.speed}
                  color="oklch(0.70 0.20 46)"
                />
                <StatBar
                  label="GRP"
                  value={stats.grip}
                  color="oklch(0.62 0.18 148)"
                />
                <StatBar
                  label="SUS"
                  value={stats.suspension}
                  color="oklch(0.62 0.16 232)"
                />
                <StatBar
                  label="FUEL"
                  value={stats.fuel}
                  color="oklch(0.72 0.16 86)"
                />
              </div>

              {/* Action button */}
              <div style={{ flexShrink: 0 }}>
                {isUnlocked && !isSelected && (
                  <button
                    type="button"
                    data-ocid={`vehicles.item.${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVehicle(vType);
                    }}
                    style={{
                      background: "oklch(0.20 0.044 238)",
                      border: "1px solid oklch(0.30 0.050 238 / 0.7)",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "oklch(0.75 0.014 228)",
                      cursor: "pointer",
                      fontFamily: "BricolageGrotesque, sans-serif",
                      letterSpacing: "0.05em",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    SELECT
                  </button>
                )}
                {!isUnlocked && (
                  <button
                    type="button"
                    data-ocid={`vehicles.unlock.button.${i + 1}`}
                    disabled={!canAfford}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canAfford) onUnlockVehicle(vType);
                    }}
                    style={{
                      background: canAfford
                        ? "linear-gradient(135deg, oklch(0.72 0.21 48), oklch(0.58 0.24 38))"
                        : "oklch(0.15 0.028 238)",
                      border: canAfford
                        ? "none"
                        : "1px solid oklch(0.22 0.030 238 / 0.5)",
                      borderRadius: 6,
                      padding: "5px 8px",
                      fontSize: 10,
                      fontWeight: 800,
                      color: canAfford ? "white" : "oklch(0.38 0.016 232)",
                      cursor: canAfford ? "pointer" : "not-allowed",
                      fontFamily: "BricolageGrotesque, sans-serif",
                      letterSpacing: "0.04em",
                      boxShadow: canAfford
                        ? "0 2px 10px oklch(0.70 0.21 46 / 0.3)"
                        : "none",
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        color: canAfford ? "white" : "oklch(0.50 0.020 86)",
                      }}
                    >
                      🪙
                    </span>{" "}
                    <span
                      style={{
                        color: canAfford ? "white" : "oklch(0.38 0.016 232)",
                      }}
                    >
                      {cfg.unlockCost}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
