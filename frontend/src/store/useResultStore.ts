import { create } from "zustand";

import { GameResult } from "@/shared/types/game/results.ts";

interface ResultStore extends GameResult {
  setResult: (result: Partial<GameResult>) => void;
  resetResult: () => void;
  getResult: () => GameResult;
}

const initialState: GameResult = {
  musicId: "",
  difficulty: 0,
  score: 0,
  accuracy: 0,
  rank: "F",
  combo: [],
  isFullCombo: false,
  isAllPerfect: false,
  earlyCount: 0,
  lateCount: 0,
  perfect: 0,
  great: 0,
  good: 0,
  miss: 0,
  bad: 0,
  playedAt: new Date().toISOString(),
};

// Helper function to update combo
const updateCombo = (
  currentCombo: string[],
  currentTime: number,
  isComboBreak: boolean = false,
) => {
  if (currentCombo.length === 0) {
    // Start new combo
    return [`${currentTime}-${currentTime}-1`];
  }

  const lastCombo = currentCombo[currentCombo.length - 1];
  const [startTime, endTime, count] = lastCombo.split("-").map(Number);

  if (isComboBreak) {
    // End current combo and start a new one
    return [...currentCombo, `${currentTime}-${currentTime}-1`];
  } else {
    // Continue current combo
    const updatedCombo = [...currentCombo];
    updatedCombo[updatedCombo.length - 1] =
      `${startTime}-${currentTime}-${count + 1}`;
    return updatedCombo;
  }
};

export const useResultStore = create<ResultStore>((set, get) => ({
  ...initialState,
  setResult: (result) => set((state) => ({ ...state, ...result })),
  resetResult: () => set(initialState),
  getResult: () => {
    const { setResult, resetResult, getResult, ...result } = get();
    return result;
  },
}));
