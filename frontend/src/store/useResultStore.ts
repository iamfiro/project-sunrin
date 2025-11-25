import { create } from "zustand";

import { GameResult } from "@/shared/types/game/results.ts";

interface ResultStore extends GameResult {
  setResult: (result: Partial<GameResult>) => void;
  resetResult: () => void;
  getResult: () => GameResult;
}

const initialState: GameResult = {
  score: 0,
  combo: 0,
  great: "",
  good: "",
  bad: "",
  miss: "",
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
