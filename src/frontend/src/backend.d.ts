import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ScoreEntry {
    coins: bigint;
    distance: bigint;
    playerName: string;
}
export interface backendInterface {
    getTopScores(): Promise<Array<ScoreEntry>>;
    submitScore(playerName: string, distance: bigint, coins: bigint): Promise<void>;
}
