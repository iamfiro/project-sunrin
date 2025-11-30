import { create } from "zustand";

export type HitEffectType = "perfect" | "great" | "good" | null;

interface HitEffect {
  id: number;
  lane: number;
  judgement: HitEffectType;
}

interface HitEffectStore {
  effects: HitEffect[];
  nextId: number;
  triggerEffect: (lane: number, judgement: HitEffectType) => void;
  removeEffect: (id: number) => void;
}

// 최대 동시 이펙트 수 (성능 제한)
const MAX_EFFECTS = 12;

export const useHitEffectStore = create<HitEffectStore>((set) => ({
  effects: [],
  nextId: 0,

  triggerEffect: (lane: number, judgement: HitEffectType) => {
    set((state) => {
      const newEffect: HitEffect = {
        id: state.nextId,
        lane,
        judgement,
      };

      // 최대 개수 초과 시 가장 오래된 것 제거
      const updatedEffects =
        state.effects.length >= MAX_EFFECTS
          ? [...state.effects.slice(1), newEffect]
          : [...state.effects, newEffect];

      return {
        effects: updatedEffects,
        nextId: state.nextId + 1,
      };
    });
  },

  removeEffect: (id: number) => {
    set((state) => ({
      effects: state.effects.filter((effect) => effect.id !== id),
    }));
  },
}));
