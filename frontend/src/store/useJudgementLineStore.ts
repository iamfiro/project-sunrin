import { create } from "zustand";

export type TimingType = "early" | "perfect" | "late";

interface JudgementIndicator {
  id: string;
  timing: number; // -1 (early) ~ 0 (perfect) ~ 1 (late)
  type: TimingType;
  timestamp: number;
}

interface JudgementLineStore {
  indicators: JudgementIndicator[];
  addIndicator: (timing: number, type: TimingType) => void;
  removeIndicator: (id: string) => void;
  clearIndicators: () => void;
}

export const useJudgementLineStore = create<JudgementLineStore>((set) => ({
  indicators: [],

  addIndicator: (timing, type) => {
    const id = `${Date.now()}-${Math.random()}`;
    const indicator: JudgementIndicator = {
      id,
      timing,
      type,
      timestamp: Date.now(),
    };

    set((state) => ({
      indicators: [...state.indicators, indicator],
    }));

    // 애니메이션 후 자동 제거 (1초)
    setTimeout(() => {
      set((state) => ({
        indicators: state.indicators.filter((ind) => ind.id !== id),
      }));
    }, 1000);
  },

  removeIndicator: (id) =>
    set((state) => ({
      indicators: state.indicators.filter((ind) => ind.id !== id),
    })),

  clearIndicators: () => set({ indicators: [] }),
}));
