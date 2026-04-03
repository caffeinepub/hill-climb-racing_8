import { Circle, Fuel, Settings, Zap } from "lucide-react";
import type React from "react";
import type { Upgrades, VehicleType } from "../game/types";
import {
  MAX_UPGRADE_LEVEL,
  UPGRADE_COSTS,
  VEHICLE_CONFIGS,
} from "../game/types";

interface UpgradesProps {
  upgrades: Upgrades;
  totalCoins: number;
  selectedVehicle: VehicleType;
  onUpgrade: (type: keyof Upgrades) => void;
}

const UPGRADE_CONFIG: {
  key: keyof Upgrades;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  colorDot: string;
}[] = [
  {
    key: "engine",
    label: "Engine",
    desc: "More traction force",
    icon: <Zap size={13} />,
    color: "oklch(0.72 0.21 48)",
    colorDot: "oklch(0.72 0.21 48)",
  },
  {
    key: "suspension",
    label: "Suspension",
    desc: "Better spring control",
    icon: <Settings size={13} />,
    color: "oklch(0.65 0.18 232)",
    colorDot: "oklch(0.65 0.18 232)",
  },
  {
    key: "tires",
    label: "Tires",
    desc: "Improved grip",
    icon: <Circle size={13} />,
    color: "oklch(0.65 0.18 148)",
    colorDot: "oklch(0.65 0.18 148)",
  },
  {
    key: "fuelTank",
    label: "Fuel Tank",
    desc: "More fuel capacity",
    icon: <Fuel size={13} />,
    color: "oklch(0.78 0.18 86)",
    colorDot: "oklch(0.78 0.18 86)",
  },
];

export default function UpgradesPanel({
  upgrades,
  totalCoins,
  selectedVehicle,
  onUpgrade,
}: UpgradesProps) {
  const vehicleCfg = VEHICLE_CONFIGS[selectedVehicle];

  return (
    <div className="h-full flex flex-col" data-ocid="upgrades.panel">
      <div className="flex items-center justify-between mb-4">
        <h3
          style={{
            fontFamily: "BricolageGrotesque, sans-serif",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "oklch(0.55 0.018 232)",
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
          Upgrades
        </h3>
        <div
          style={{
            background: "oklch(0.22 0.055 82 / 0.25)",
            border: "1px solid oklch(0.78 0.18 86 / 0.30)",
            borderRadius: 20,
            padding: "3px 12px",
            fontSize: 12,
            fontWeight: 800,
            color: "oklch(0.80 0.18 86)",
            fontFamily: "BricolageGrotesque, sans-serif",
            letterSpacing: "0.02em",
          }}
          data-ocid="upgrades.coins.panel"
        >
          🪙 {totalCoins}
        </div>
      </div>

      {/* Vehicle context label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 10,
          padding: "5px 10px",
          background: `${vehicleCfg.bodyColor}18`,
          border: `1px solid ${vehicleCfg.accentColor}44`,
          borderRadius: 6,
        }}
        data-ocid="upgrades.vehicle.panel"
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: vehicleCfg.accentColor,
            display: "inline-block",
            flexShrink: 0,
            boxShadow: `0 0 5px ${vehicleCfg.accentColor}`,
          }}
        />
        <span
          style={{
            fontSize: 10,
            color: "oklch(0.60 0.018 228)",
            fontFamily: "Figtree, sans-serif",
          }}
        >
          Upgrading:{" "}
          <span
            style={{
              fontWeight: 700,
              color: vehicleCfg.accentColor,
              fontFamily: "BricolageGrotesque, sans-serif",
            }}
          >
            {vehicleCfg.name}
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {UPGRADE_CONFIG.map((cfg) => {
          const level = upgrades[cfg.key];
          const isMaxed = level >= MAX_UPGRADE_LEVEL;
          const cost = isMaxed ? 0 : UPGRADE_COSTS[level];
          const canAfford = totalCoins >= cost;

          return (
            <div
              key={cfg.key}
              data-ocid={`upgrades.${cfg.key}.panel`}
              className="upgrade-row"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      color: cfg.color,
                      display: "flex",
                      flexShrink: 0,
                    }}
                  >
                    {cfg.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "oklch(0.88 0.010 225)",
                      fontFamily: "BricolageGrotesque, sans-serif",
                    }}
                  >
                    {cfg.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "oklch(0.48 0.016 232)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cfg.desc}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isMaxed || !canAfford}
                  onClick={() => onUpgrade(cfg.key)}
                  data-ocid={`upgrades.${cfg.key}.primary_button`}
                  style={{
                    background: isMaxed
                      ? "oklch(0.22 0.035 238)"
                      : canAfford
                        ? "linear-gradient(135deg, oklch(0.72 0.21 48), oklch(0.58 0.24 38))"
                        : "oklch(0.18 0.030 238)",
                    color: isMaxed
                      ? "oklch(0.45 0.018 232)"
                      : canAfford
                        ? "white"
                        : "oklch(0.38 0.016 232)",
                    border: isMaxed
                      ? "1px solid oklch(0.28 0.038 238 / 0.6)"
                      : canAfford
                        ? "none"
                        : "1px solid oklch(0.24 0.030 238 / 0.5)",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: "BricolageGrotesque, sans-serif",
                    cursor: isMaxed || !canAfford ? "default" : "pointer",
                    whiteSpace: "nowrap",
                    minWidth: 56,
                    transition: "box-shadow 0.15s, transform 0.1s",
                    boxShadow:
                      canAfford && !isMaxed
                        ? "0 2px 10px oklch(0.70 0.21 46 / 0.25)"
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {isMaxed ? "MAX" : `🪙 ${cost}`}
                </button>
              </div>

              {/* Progress bar */}
              <div className="upgrade-bar-track">
                <div
                  className="upgrade-bar-fill"
                  style={{
                    width: `${(level / MAX_UPGRADE_LEVEL) * 100}%`,
                    background: isMaxed
                      ? `linear-gradient(90deg, ${cfg.color}, ${cfg.color})`
                      : undefined,
                    boxShadow: isMaxed ? `0 0 8px ${cfg.color}` : undefined,
                  }}
                />
              </div>

              {/* Level dots */}
              <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                {Array.from({ length: MAX_UPGRADE_LEVEL }).map((_, dotIdx) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length array
                    key={dotIdx}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background:
                        dotIdx < level ? cfg.colorDot : "oklch(0.22 0.038 240)",
                      boxShadow:
                        dotIdx < level ? `0 0 4px ${cfg.colorDot}` : "none",
                      transition: "background 0.3s, box-shadow 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
