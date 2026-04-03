import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Medal, Trophy } from "lucide-react";
import React, { useState } from "react";
import { useActor } from "../hooks/useActor";

interface LeaderboardProps {
  pendingScore?: { distance: number; coins: number } | null;
}

export default function Leaderboard({ pendingScore }: LeaderboardProps) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ["topScores"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getTopScores();
      return raw.map((s) => ({
        playerName: s.playerName,
        distance: Number(s.distance),
        coins: Number(s.coins),
      }));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !pendingScore) throw new Error("No actor or score");
      const name = playerName.trim() || "Anonymous";
      await actor.submitScore(
        name,
        BigInt(pendingScore.distance),
        BigInt(pendingScore.coins),
      );
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["topScores"] });
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 0)
      return <Trophy size={13} style={{ color: "oklch(0.82 0.18 86)" }} />;
    if (rank === 1)
      return <Medal size={13} style={{ color: "oklch(0.78 0.04 230)" }} />;
    if (rank === 2)
      return <Medal size={13} style={{ color: "oklch(0.62 0.10 50)" }} />;
    return (
      <span
        style={{
          color: "oklch(0.42 0.016 232)",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "BricolageGrotesque, sans-serif",
        }}
      >
        #{rank + 1}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col" data-ocid="leaderboard.panel">
      <div className="flex items-center gap-2 mb-4">
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
          Leaderboard
        </h3>
      </div>

      {/* Submit form */}
      {pendingScore && !submitted && (
        <div
          style={{
            background: "oklch(0.22 0.055 82 / 0.18)",
            border: "1px solid oklch(0.78 0.18 86 / 0.35)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 12,
          }}
          data-ocid="leaderboard.submit.panel"
        >
          <div
            style={{
              fontSize: 11,
              color: "oklch(0.72 0.14 82)",
              marginBottom: 8,
              fontWeight: 700,
              fontFamily: "BricolageGrotesque, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            🏁 Submit: {pendingScore.distance}m · {pendingScore.coins} coins
          </div>
          <div className="flex gap-2">
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitMutation.mutate();
              }}
              data-ocid="leaderboard.name.input"
              style={{
                flex: 1,
                border: "1px solid oklch(0.28 0.042 238 / 0.8)",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 12,
                background: "oklch(0.14 0.042 240)",
                color: "oklch(0.92 0.008 225)",
                outline: "none",
                fontFamily: "Figtree, sans-serif",
              }}
            />
            <button
              type="button"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              data-ocid="leaderboard.submit.primary_button"
              className="btn-orange"
              style={{
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
                cursor: submitMutation.isPending ? "wait" : "pointer",
              }}
            >
              {submitMutation.isPending ? (
                <Loader2 size={10} className="animate-spin" />
              ) : null}
              Submit
            </button>
          </div>
          {submitMutation.isError && (
            <div
              style={{
                color: "oklch(0.62 0.20 27)",
                fontSize: 11,
                marginTop: 5,
              }}
              data-ocid="leaderboard.error_state"
            >
              Failed to submit. Try again.
            </div>
          )}
        </div>
      )}

      {submitted && (
        <div
          style={{
            background: "oklch(0.20 0.09 148 / 0.25)",
            border: "1px solid oklch(0.55 0.14 148 / 0.45)",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 10,
            fontSize: 12,
            color: "oklch(0.70 0.15 148)",
            fontFamily: "BricolageGrotesque, sans-serif",
            fontWeight: 600,
          }}
          data-ocid="leaderboard.success_state"
        >
          ✓ Score submitted!
        </div>
      )}

      {/* Scores list */}
      <div className="flex-1 overflow-y-auto" data-ocid="leaderboard.table">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-6"
            data-ocid="leaderboard.loading_state"
          >
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: "oklch(0.45 0.018 232)" }}
            />
          </div>
        ) : scores.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "oklch(0.42 0.016 232)",
              fontSize: 12,
              paddingTop: 20,
              fontFamily: "Figtree, sans-serif",
            }}
            data-ocid="leaderboard.empty_state"
          >
            No scores yet. Be the first!
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {scores.slice(0, 10).map((s, i) => (
              <div
                key={`${s.playerName}-${i}`}
                data-ocid={`leaderboard.item.${i + 1}`}
                className="leaderboard-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  background:
                    i === 0 ? "oklch(0.22 0.055 82 / 0.16)" : "transparent",
                  border:
                    i === 0
                      ? "1px solid oklch(0.78 0.18 86 / 0.22)"
                      : "1px solid transparent",
                  borderRadius: 7,
                }}
              >
                <div
                  style={{
                    width: 20,
                    display: "flex",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getRankIcon(i)}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color:
                      i < 3 ? "oklch(0.88 0.010 225)" : "oklch(0.72 0.014 228)",
                    fontWeight: i < 3 ? 700 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "BricolageGrotesque, sans-serif",
                  }}
                >
                  {s.playerName}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "oklch(0.50 0.016 232)",
                    whiteSpace: "nowrap",
                    fontFamily: "Figtree, sans-serif",
                  }}
                >
                  {s.distance}m
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "oklch(0.80 0.18 86)",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    fontFamily: "BricolageGrotesque, sans-serif",
                  }}
                >
                  {s.coins} 🪙
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
