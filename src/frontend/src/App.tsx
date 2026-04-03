import { Toaster } from "@/components/ui/sonner";
import {
  Car,
  ChevronLeft,
  ExternalLink,
  Play,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState, useCallback, useEffect } from "react";
import { SiDiscord, SiGithub } from "react-icons/si";
import Leaderboard from "./components/Leaderboard";
import UpgradesPanel from "./components/Upgrades";
import VehicleShowcase from "./components/VehicleShowcase";
import HillClimbGame from "./game/HillClimbGame";
import type { Upgrades, VehicleType } from "./game/types";
import {
  MAX_UPGRADE_LEVEL,
  UPGRADE_COSTS,
  VEHICLE_CONFIGS,
} from "./game/types";

const COINS_STORAGE_KEY = "hcr1_total_coins";

function getUpgradesKey(vehicleType: VehicleType): string {
  return `hcr1_upgrades_${vehicleType}`;
}

function loadUpgradesForVehicle(vehicleType: VehicleType): Upgrades {
  try {
    const raw = localStorage.getItem(getUpgradesKey(vehicleType));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { engine: 0, suspension: 0, tires: 0, fuelTank: 0 };
}

function saveUpgradesForVehicle(vehicleType: VehicleType, upgrades: Upgrades) {
  localStorage.setItem(getUpgradesKey(vehicleType), JSON.stringify(upgrades));
}

function loadTotalCoins(): number {
  try {
    const raw = localStorage.getItem(COINS_STORAGE_KEY);
    if (raw) return Number.parseInt(raw, 10) || 0;
  } catch {}
  return 0;
}

function saveTotalCoins(coins: number) {
  localStorage.setItem(COINS_STORAGE_KEY, String(coins));
}

const NAV_LINKS = [
  { id: "play", label: "Play Now", icon: <Play size={11} /> },
  { id: "vehicles", label: "Vehicles", icon: <Car size={11} /> },
  { id: "upgrades", label: "Upgrades", icon: <Zap size={11} /> },
  { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={11} /> },
];

export default function App() {
  const [activeSection, setActiveSection] = useState("play");

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(() => {
    return (localStorage.getItem("hcr1_vehicle") as VehicleType) || "JEEP";
  });

  const [unlockedVehicles, setUnlockedVehicles] = useState<VehicleType[]>(
    () => {
      try {
        const raw = localStorage.getItem("hcr1_unlocked");
        return raw ? JSON.parse(raw) : ["JEEP", "MOTORCYCLE"];
      } catch {
        return ["JEEP", "MOTORCYCLE"];
      }
    },
  );

  const [upgrades, setUpgrades] = useState<Upgrades>(() =>
    loadUpgradesForVehicle(
      (localStorage.getItem("hcr1_vehicle") as VehicleType) || "JEEP",
    ),
  );

  const [totalCoins, setTotalCoins] = useState<number>(loadTotalCoins);
  const [pendingScore, setPendingScore] = useState<{
    distance: number;
    coins: number;
  } | null>(null);
  const [liveCoins, setLiveCoins] = useState(0);

  // Reload upgrades when vehicle changes
  useEffect(() => {
    setUpgrades(loadUpgradesForVehicle(selectedVehicle));
  }, [selectedVehicle]);

  const handleGameOver = useCallback((distance: number, coins: number) => {
    setTotalCoins((prev) => {
      const next = prev + coins;
      saveTotalCoins(next);
      return next;
    });
    setPendingScore({ distance, coins });
    setActiveSection("leaderboard");
  }, []);

  const handleCoinsUpdate = useCallback((coins: number) => {
    setLiveCoins(coins);
  }, []);

  const handleUpgrade = useCallback(
    (type: keyof Upgrades) => {
      setUpgrades((prev) => {
        const level = prev[type];
        if (level >= MAX_UPGRADE_LEVEL) return prev;
        const cost = UPGRADE_COSTS[level];
        if (totalCoins < cost) return prev;
        const next = { ...prev, [type]: level + 1 };
        saveUpgradesForVehicle(selectedVehicle, next);
        setTotalCoins((c) => {
          const nc = c - cost;
          saveTotalCoins(nc);
          return nc;
        });
        return next;
      });
    },
    [totalCoins, selectedVehicle],
  );

  const handleSelectVehicle = useCallback(
    (v: VehicleType) => {
      if (!unlockedVehicles.includes(v)) return;
      setSelectedVehicle(v);
      localStorage.setItem("hcr1_vehicle", v);
    },
    [unlockedVehicles],
  );

  const handleUnlockVehicle = useCallback(
    (v: VehicleType) => {
      const cost = VEHICLE_CONFIGS[v].unlockCost;
      if (totalCoins < cost) return;
      setTotalCoins((c) => {
        const n = c - cost;
        saveTotalCoins(n);
        return n;
      });
      setUnlockedVehicles((prev) => {
        const next = [...prev, v];
        localStorage.setItem("hcr1_unlocked", JSON.stringify(next));
        return next;
      });
    },
    [totalCoins],
  );

  useEffect(() => {
    document.title = "HCR1 — Hill Climb Racing";
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (id === "play") {
      const el = document.getElementById("game-section");
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      const el = document.getElementById("info-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "hcr1";
  const caffeineLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 120% 60% at 50% -10%, oklch(0.20 0.06 240 / 0.5) 0%, transparent 70%), linear-gradient(180deg, oklch(0.07 0.038 244) 0%, oklch(0.09 0.040 242) 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "20px 8px 40px",
      }}
    >
      <Toaster />

      {/* Stage wrapper */}
      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          borderRadius: 16,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, oklch(0.12 0.044 240) 0%, oklch(0.10 0.040 242) 100%)",
          border: "1px solid oklch(0.22 0.044 238 / 0.7)",
          boxShadow:
            "0 2px 0 oklch(0.28 0.06 238 / 0.4), 0 12px 80px oklch(0.05 0.03 244 / 0.8), 0 0 0 1px oklch(0.14 0.040 240)",
          position: "relative",
        }}
      >
        {/* Left chevron */}
        <button
          type="button"
          onClick={() => scrollToSection("play")}
          data-ocid="nav.back.button"
          style={{
            position: "absolute",
            left: -18,
            top: "50%",
            transform: "translateY(-50%)",
            width: 36,
            height: 56,
            background:
              "linear-gradient(135deg, oklch(0.72 0.21 48), oklch(0.58 0.24 38))",
            border: "none",
            borderRadius: "0 8px 8px 0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            zIndex: 10,
            boxShadow: "3px 0 16px oklch(0.70 0.21 46 / 0.4)",
            transition: "box-shadow 0.2s",
          }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* ─── Header / Nav ─── */}
        <header
          style={{
            background:
              "linear-gradient(90deg, oklch(0.14 0.048 238) 0%, oklch(0.12 0.044 240) 100%)",
            borderBottom: "1px solid oklch(0.22 0.044 238 / 0.8)",
            padding: "0 28px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "inset 0 1px 0 oklch(0.30 0.05 238 / 0.4)",
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontFamily: "BricolageGrotesque, sans-serif",
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              userSelect: "none",
              lineHeight: 1,
            }}
          >
            <span
              style={{
                color: "oklch(0.97 0.005 220)",
                textShadow: "0 0 30px oklch(0.97 0.005 220 / 0.15)",
              }}
            >
              HCR
            </span>
            <span
              style={{
                color: "oklch(0.72 0.21 48)",
                textShadow: "0 0 20px oklch(0.70 0.21 46 / 0.5)",
              }}
            >
              1
            </span>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", gap: 28 }}>
            {NAV_LINKS.map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`nav-link${activeSection === link.id ? " active" : ""}`}
                data-ocid={`nav.${link.id}.link`}
                style={{
                  background: "none",
                  border: "none",
                  color:
                    activeSection === link.id
                      ? "oklch(0.72 0.21 48)"
                      : "oklch(0.60 0.018 228)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "2px 0 4px",
                  cursor: "pointer",
                }}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </nav>

          {/* Coin balance */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: "oklch(0.22 0.055 82 / 0.25)",
                border: "1px solid oklch(0.78 0.18 86 / 0.30)",
                borderRadius: 20,
                padding: "5px 14px",
                fontSize: 13,
                fontWeight: 800,
                color: "oklch(0.80 0.18 86)",
                fontFamily: "BricolageGrotesque, sans-serif",
                letterSpacing: "0.02em",
              }}
            >
              🪙 {totalCoins}
            </div>
            <button
              type="button"
              className="btn-orange"
              onClick={() => scrollToSection("play")}
              data-ocid="nav.play.primary_button"
              style={{
                padding: "9px 24px",
                borderRadius: 24,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Play size={11} />
              PLAY GAME
            </button>
          </div>
        </header>

        {/* ─── Game Section ─── */}
        <section
          id="game-section"
          className="game-section-bg"
          style={{
            padding: "28px 24px 18px",
            background:
              "linear-gradient(180deg, oklch(0.12 0.046 238) 0%, oklch(0.10 0.040 242) 100%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="game-canvas-wrapper">
              <HillClimbGame
                key={selectedVehicle}
                onGameOver={handleGameOver}
                onCoinsUpdate={handleCoinsUpdate}
                upgrades={upgrades}
                selectedVehicle={selectedVehicle}
              />
            </div>
          </motion.div>

          {/* Quick stats under canvas */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 14,
              padding: "10px 18px",
              background: "oklch(0.14 0.044 240 / 0.7)",
              borderRadius: 8,
              border: "1px solid oklch(0.22 0.040 238 / 0.6)",
              backdropFilter: "blur(4px)",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "oklch(0.58 0.018 230)",
                fontFamily: "BricolageGrotesque, sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              <span style={{ color: "oklch(0.72 0.21 48)", fontWeight: 700 }}>
                → / D
              </span>{" "}
              Gas
            </div>
            <div
              style={{
                fontSize: 11,
                color: "oklch(0.58 0.018 230)",
                fontFamily: "BricolageGrotesque, sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              <span style={{ color: "oklch(0.72 0.21 48)", fontWeight: 700 }}>
                ← / A
              </span>{" "}
              Brake
            </div>
            {/* Current vehicle badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                background: `${VEHICLE_CONFIGS[selectedVehicle].bodyColor}22`,
                border: `1px solid ${VEHICLE_CONFIGS[selectedVehicle].accentColor}44`,
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 700,
                color: VEHICLE_CONFIGS[selectedVehicle].accentColor,
                fontFamily: "BricolageGrotesque, sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: VEHICLE_CONFIGS[selectedVehicle].accentColor,
                  display: "inline-block",
                }}
              />
              {VEHICLE_CONFIGS[selectedVehicle].name}
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontSize: 11,
                color: "oklch(0.58 0.018 230)",
                fontFamily: "BricolageGrotesque, sans-serif",
              }}
            >
              Wallet:{" "}
              <span style={{ color: "oklch(0.82 0.18 86)", fontWeight: 700 }}>
                🪙 {totalCoins + liveCoins}
              </span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "oklch(0.58 0.018 230)",
                fontFamily: "BricolageGrotesque, sans-serif",
              }}
            >
              Stage:{" "}
              <span style={{ color: "oklch(0.82 0.18 86)", fontWeight: 700 }}>
                {liveCoins}
              </span>
            </div>
          </div>
        </section>

        {/* ─── Info Section (dark themed) ─── */}
        <section
          id="info-section"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.11 0.042 241) 0%, oklch(0.10 0.040 242) 100%)",
            borderTop: "1px solid oklch(0.20 0.042 238 / 0.8)",
            padding: "0",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
                gap: 0,
              }}
            >
              {/* Vehicles column */}
              <div
                style={{ padding: "24px 24px" }}
                className="info-panel-col"
                data-ocid="vehicles.section"
              >
                <VehicleShowcase
                  selectedVehicle={selectedVehicle}
                  unlockedVehicles={unlockedVehicles}
                  totalCoins={totalCoins}
                  onSelectVehicle={handleSelectVehicle}
                  onUnlockVehicle={handleUnlockVehicle}
                />
              </div>

              {/* Divider */}
              <div className="info-section-divider" />

              {/* Upgrades column */}
              <div
                style={{ padding: "24px 24px", cursor: "default" }}
                className="info-panel-col"
                data-ocid="upgrades.section"
              >
                <UpgradesPanel
                  upgrades={upgrades}
                  totalCoins={totalCoins}
                  selectedVehicle={selectedVehicle}
                  onUpgrade={handleUpgrade}
                />
              </div>

              {/* Divider */}
              <div className="info-section-divider" />

              {/* Leaderboard column */}
              <div
                style={{ padding: "24px 24px" }}
                className="info-panel-col"
                data-ocid="leaderboard.section"
              >
                <Leaderboard pendingScore={pendingScore} />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── Footer ─── */}
        <footer
          style={{
            background: "oklch(0.07 0.034 244)",
            borderTop: "1px solid oklch(0.18 0.040 240 / 0.7)",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {/* Legal links */}
          <div style={{ display: "flex", gap: 16 }}>
            {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((l) => (
              <button
                type="button"
                key={l}
                style={{
                  fontSize: 11,
                  color: "oklch(0.45 0.018 232)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "color 0.15s",
                  fontFamily: "Figtree, sans-serif",
                }}
                data-ocid={`footer.${l.toLowerCase().replace(/ /g, "_")}.link`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Social icons */}
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button
              type="button"
              style={{
                color: "oklch(0.45 0.018 232)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s",
              }}
              data-ocid="footer.github.link"
            >
              <SiGithub size={15} />
            </button>
            <button
              type="button"
              style={{
                color: "oklch(0.45 0.018 232)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s",
              }}
              data-ocid="footer.discord.link"
            >
              <SiDiscord size={15} />
            </button>
            <button
              type="button"
              style={{
                color: "oklch(0.45 0.018 232)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s",
              }}
              data-ocid="footer.external.link"
            >
              <ExternalLink size={13} />
            </button>
          </div>

          {/* Brand mark */}
          <div
            style={{
              fontSize: 11,
              color: "oklch(0.45 0.018 232)",
              fontFamily: "Figtree, sans-serif",
            }}
          >
            © {new Date().getFullYear()}.{" "}
            <a
              href={caffeineLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "oklch(0.72 0.21 48)",
                textDecoration: "none",
              }}
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
