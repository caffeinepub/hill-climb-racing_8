import React, { useRef, useEffect, useState, useCallback } from "react";
import { initGameData, renderGame, stepPhysics } from "./gameEngine";
import type {
  GameData,
  GameState,
  StageType,
  Upgrades,
  VehicleType,
} from "./types";
import { VEHICLE_CONFIGS } from "./types";

interface HillClimbGameProps {
  onGameOver: (distance: number, coins: number) => void;
  onCoinsUpdate: (coins: number) => void;
  upgrades: Upgrades;
  selectedVehicle: VehicleType;
}

const STAGES: { id: StageType; label: string; desc: string; color: string }[] =
  [
    {
      id: "COUNTRYSIDE",
      label: "Countryside",
      desc: "Rolling hills and gentle slopes",
      color: "#3a7030",
    },
    {
      id: "DESERT",
      label: "Desert",
      desc: "Steep sandy dunes, scorching heat",
      color: "#c8902a",
    },
    {
      id: "ARCTIC",
      label: "Arctic",
      desc: "Icy mountains, extreme terrain",
      color: "#60a0c0",
    },
  ];

export default function HillClimbGame({
  onGameOver,
  onCoinsUpdate,
  upgrades,
  selectedVehicle,
}: HillClimbGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameDataRef = useRef<GameData | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const touchGasRef = useRef(false);
  const touchBrakeRef = useRef(false);
  const upgradesRef = useRef(upgrades);
  upgradesRef.current = upgrades;
  const selectedVehicleRef = useRef(selectedVehicle);
  selectedVehicleRef.current = selectedVehicle;

  const [gameState, setGameState] = useState<GameState>("MENU");
  const [selectedStage, setSelectedStage] = useState<StageType>("COUNTRYSIDE");
  const [finalDistance, setFinalDistance] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);

  const vehicleCfg = VEHICLE_CONFIGS[selectedVehicle];

  const stopGame = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, []);

  const startGame = useCallback((stage: StageType) => {
    const data = initGameData(
      stage,
      upgradesRef.current,
      selectedVehicleRef.current,
    );
    gameDataRef.current = data;
    setGameState("PLAYING");
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== "PLAYING") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const rawDt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      const data = gameDataRef.current;
      if (!data) return;

      data.isGassing =
        keysRef.current.has("ArrowRight") ||
        keysRef.current.has("d") ||
        keysRef.current.has("D") ||
        touchGasRef.current;
      data.isBraking =
        keysRef.current.has("ArrowLeft") ||
        keysRef.current.has("a") ||
        keysRef.current.has("A") ||
        touchBrakeRef.current;

      stepPhysics(data, rawDt, upgradesRef.current);

      const canvasW = canvas.offsetWidth || 800;
      const canvasH = canvas.offsetHeight || 400;
      if (canvas.width !== canvasW || canvas.height !== canvasH) {
        canvas.width = canvasW;
        canvas.height = canvasH;
      }

      renderGame(ctx, data, canvasW, canvasH, data.time);

      if (data.gameState === "GAME_OVER") {
        const dist = Math.floor(data.distance / 10);
        const coins = data.coinsCollected;
        setFinalDistance(dist);
        setFinalCoins(coins);
        setGameState("GAME_OVER");
        onGameOver(dist, coins);
        return;
      }

      onCoinsUpdate(data.coinsCollected);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => stopGame();
  }, [gameState, stopGame, onGameOver, onCoinsUpdate]);

  // Keyboard events
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Touch on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getTouchState = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasW = rect.width;
      const canvasH = rect.height;
      let gas = false;
      let brake = false;

      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const tx = touch.clientX - rect.left;
        const ty = touch.clientY - rect.top;
        const btnH = 58;
        const btnY = canvasH - btnH;
        if (ty > btnY - 10) {
          if (tx > canvasW - 130) gas = true;
          else if (tx < 130) brake = true;
        }
      }
      touchGasRef.current = gas;
      touchBrakeRef.current = brake;
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      getTouchState(e);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      getTouchState(e);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      getTouchState(e);
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const retryGame = () => {
    stopGame();
    startGame(selectedStage);
  };

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: "2 / 1", minHeight: 280 }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          display: gameState === "PLAYING" ? "block" : "none",
          cursor: "none",
          touchAction: "none",
        }}
        tabIndex={0}
      />

      {/* Menu */}
      {gameState === "MENU" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.18 0.060 238 / 0.8) 0%, transparent 70%), linear-gradient(180deg, oklch(0.09 0.042 242) 0%, oklch(0.11 0.044 240) 100%)",
            borderRadius: 8,
          }}
          data-ocid="game.panel"
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "20%",
              right: "20%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, oklch(0.72 0.21 48 / 0.6), transparent)",
              borderRadius: 1,
            }}
          />

          <div className="text-center mb-6" style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 240,
                height: 80,
                background:
                  "radial-gradient(ellipse, oklch(0.70 0.21 46 / 0.18) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <h2
              style={{
                fontFamily: "BricolageGrotesque, sans-serif",
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: 4,
                position: "relative",
              }}
            >
              <span
                style={{
                  color: "oklch(0.97 0.005 220)",
                  textShadow: "0 2px 20px oklch(0.97 0.005 220 / 0.15)",
                }}
              >
                HCR
              </span>
              <span
                style={{
                  color: "oklch(0.72 0.21 48)",
                  textShadow:
                    "0 0 30px oklch(0.70 0.21 46 / 0.6), 0 2px 8px oklch(0.58 0.24 38 / 0.4)",
                }}
              >
                1
              </span>
            </h2>

            {/* Vehicle badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: `${vehicleCfg.bodyColor}28`,
                border: `1px solid ${vehicleCfg.bodyColor}66`,
                borderRadius: 20,
                padding: "4px 12px",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: vehicleCfg.accentColor,
                  display: "inline-block",
                  boxShadow: `0 0 6px ${vehicleCfg.accentColor}`,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: vehicleCfg.accentColor,
                  fontFamily: "BricolageGrotesque, sans-serif",
                  letterSpacing: "0.06em",
                }}
              >
                {vehicleCfg.name.toUpperCase()}
              </span>
            </div>

            <p
              style={{
                color: "oklch(0.50 0.016 232)",
                fontSize: 12,
                fontFamily: "Figtree, sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              Select a stage to begin your race
            </p>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap justify-center px-4">
            {STAGES.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setSelectedStage(s.id)}
                data-ocid={`game.${s.id.toLowerCase()}.tab`}
                style={{
                  border:
                    selectedStage === s.id
                      ? `1.5px solid ${s.color}88`
                      : "1.5px solid oklch(0.22 0.040 238 / 0.7)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  background:
                    selectedStage === s.id
                      ? `${s.color}18`
                      : "oklch(0.14 0.044 240 / 0.8)",
                  color:
                    selectedStage === s.id
                      ? "oklch(0.92 0.008 225)"
                      : "oklch(0.50 0.016 232)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  minWidth: 130,
                  boxShadow:
                    selectedStage === s.id ? `0 4px 20px ${s.color}28` : "none",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    marginBottom: 3,
                    fontFamily: "BricolageGrotesque, sans-serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color:
                      selectedStage === s.id
                        ? s.color
                        : "oklch(0.40 0.016 232)",
                    fontFamily: "Figtree, sans-serif",
                  }}
                >
                  {s.desc}
                </div>
              </button>
            ))}
          </div>

          <div
            style={{
              color: "oklch(0.40 0.016 232)",
              fontSize: 11,
              marginBottom: 16,
              fontFamily: "Figtree, sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            Controls:{" "}
            <span style={{ color: "oklch(0.72 0.21 48)", fontWeight: 700 }}>
              → / D
            </span>{" "}
            = Gas &nbsp;&nbsp;
            <span style={{ color: "oklch(0.72 0.21 48)", fontWeight: 700 }}>
              ← / A
            </span>{" "}
            = Brake
          </div>

          <button
            type="button"
            className="btn-orange"
            onClick={() => startGame(selectedStage)}
            data-ocid="game.play.primary_button"
            style={{ padding: "14px 48px", borderRadius: 10, fontSize: 16 }}
          >
            PLAY NOW
          </button>
        </div>
      )}

      {/* Game Over */}
      {gameState === "GAME_OVER" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.07 0.030 244 / 0.97) 0%, oklch(0.10 0.040 241 / 0.97) 100%)",
            borderRadius: 8,
          }}
          data-ocid="game.gameover.panel"
        >
          <div
            style={{
              border: "1px solid oklch(0.72 0.21 48 / 0.35)",
              borderRadius: 16,
              padding: "28px 36px",
              maxWidth: 360,
              width: "90%",
              textAlign: "center",
              background: "oklch(0.13 0.046 240 / 0.9)",
              boxShadow:
                "0 0 60px oklch(0.70 0.21 46 / 0.12), 0 20px 40px oklch(0.05 0.03 244 / 0.6)",
            }}
          >
            <div
              style={{
                color: "oklch(0.72 0.21 48)",
                fontSize: 32,
                fontWeight: 900,
                fontFamily: "BricolageGrotesque, sans-serif",
                marginBottom: 3,
                letterSpacing: "-0.02em",
                textShadow: "0 0 30px oklch(0.70 0.21 46 / 0.5)",
              }}
            >
              CRASHED!
            </div>
            <div
              style={{
                color: "oklch(0.48 0.016 232)",
                fontSize: 12,
                marginBottom: 20,
                fontFamily: "Figtree, sans-serif",
              }}
            >
              {vehicleCfg.name} tipped over
            </div>

            <div
              className="flex justify-center gap-10 mb-6"
              style={{
                padding: "14px 18px",
                background: "oklch(0.11 0.040 242)",
                borderRadius: 10,
                border: "1px solid oklch(0.20 0.040 238 / 0.6)",
              }}
            >
              <div>
                <div
                  style={{
                    color: "oklch(0.42 0.016 232)",
                    fontSize: 10,
                    marginBottom: 4,
                    fontFamily: "BricolageGrotesque, sans-serif",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  Distance
                </div>
                <div
                  style={{
                    color: "oklch(0.97 0.005 220)",
                    fontSize: 28,
                    fontWeight: 900,
                    fontFamily: "BricolageGrotesque, sans-serif",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {finalDistance}
                  <span
                    style={{
                      fontSize: 14,
                      color: "oklch(0.72 0.21 48)",
                      marginLeft: 2,
                    }}
                  >
                    m
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: 1,
                  background: "oklch(0.22 0.040 238 / 0.7)",
                }}
              />
              <div>
                <div
                  style={{
                    color: "oklch(0.42 0.016 232)",
                    fontSize: 10,
                    marginBottom: 4,
                    fontFamily: "BricolageGrotesque, sans-serif",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  Coins
                </div>
                <div
                  style={{
                    color: "oklch(0.82 0.18 86)",
                    fontSize: 28,
                    fontWeight: 900,
                    fontFamily: "BricolageGrotesque, sans-serif",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {finalCoins}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-orange"
              onClick={retryGame}
              data-ocid="game.retry.primary_button"
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 10,
                fontSize: 15,
                marginBottom: 10,
                display: "block",
              }}
            >
              PLAY AGAIN
            </button>
            <button
              type="button"
              onClick={() => setGameState("MENU")}
              data-ocid="game.menu.secondary_button"
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 10,
                fontSize: 13,
                background: "transparent",
                border: "1px solid oklch(0.24 0.040 238 / 0.7)",
                color: "oklch(0.50 0.016 232)",
                cursor: "pointer",
                fontFamily: "BricolageGrotesque, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.04em",
                transition: "border-color 0.15s, color 0.15s",
              }}
            >
              Stage Select
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
