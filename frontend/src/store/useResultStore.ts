import { create } from "zustand";

import { GameResult } from "@/shared/types/game/results.ts";

interface ResultStore extends GameResult {
  setResult: (result: Partial<GameResult>) => void;
  resetResult: () => void;
  getResult: () => GameResult;
  hasValidResult: () => boolean; // ⭐ 추가된 유효성 체크 함수
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
  perfectHigh: 0,
  perfect: 0,
  great: 0,
  good: 0,
  miss: 0,
  bad: 0,
  playedAt: "",
};

// combo 업데이트 로직 그대로 사용 가능
const updateCombo = (
  currentCombo: string[],
  currentTime: number,
  isComboBreak: boolean = false,
) => {
  if (currentCombo.length === 0) {
    return [`${currentTime}-${currentTime}-1`];
  }

  const lastCombo = currentCombo[currentCombo.length - 1];
  const [startTime, endTime, count] = lastCombo.split("-").map(Number);

  if (isComboBreak) {
    return [...currentCombo, `${currentTime}-${currentTime}-1`];
  } else {
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
    const { setResult, resetResult, getResult, hasValidResult, ...result } =
      get();
    return result;
  },

  // ⭐ 결과가 실제로 존재하는지 체크하는 함수
  hasValidResult: () => {
    const s = get();
    return !(s.score === 0 && s.accuracy === 0 && s.rank === "F");
  },
}));
