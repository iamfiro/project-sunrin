import { create } from "zustand";

export type TimingType = "early" | "perfect" | "late" | "miss";

interface JudgementLineStore {
  currentTiming: number; // -1 (early) ~ 0 (perfect) ~ 1 (late)
  currentType: TimingType;
  isAnimating: boolean;
  updateTiming: (timing: number, type: TimingType) => void;
  resetTiming: () => void;
}

export const useJudgementLineStore = create<JudgementLineStore>((set) => ({
  currentTiming: 0,
  currentType: "perfect",
  isAnimating: false,

  updateTiming: (timing, type) => {
    set({
      currentTiming: timing,
      currentType: type,
      isAnimating: true,
    });

    // 애니메이션 후 중앙으로 복귀
    setTimeout(() => {
      set({
        currentTiming: 0,
        currentType: "perfect",
        isAnimating: false,
      });
    }, 300);
  },

  resetTiming: () =>
    set({
      currentTiming: 0,
      currentType: "perfect",
      isAnimating: false,
    }),
}));
