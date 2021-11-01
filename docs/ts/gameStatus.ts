import { MachinePlayer } from "./machinePlayer.js";

export interface GameStatus {
    currentNumOfCoin: number;
    currentPlayer: MachinePlayer | "human";
    nextPlayer: MachinePlayer | "human";
}