import { create } from "zustand";

interface ActiveHoldNote {
  noteId: string;
  lane: number;
  startTime: number;
  endTime: number; // startTime + duration
}

interface HoldNoteStore {
  activeHolds: Map<number, ActiveHoldNote>; // lane -> activeHoldNote
  startHold: (
    lane: number,
    noteId: string,
    startTime: number,
    duration: number,
  ) => void;
  endHold: (lane: number) => ActiveHoldNote | undefined;
  getActiveHold: (lane: number) => ActiveHoldNote | undefined;
  isHolding: (lane: number) => boolean;
  clearAll: () => void;
}

export const useHoldNoteStore = create<HoldNoteStore>((set, get) => ({
  activeHolds: new Map(),

  startHold: (lane, noteId, startTime, duration) => {
    set((state) => {
      const newMap = new Map(state.activeHolds);
      newMap.set(lane, {
        noteId,
        lane,
        startTime,
        endTime: startTime + duration,
      });
      return { activeHolds: newMap };
    });
  },

  endHold: (lane) => {
    const hold = get().activeHolds.get(lane);
    set((state) => {
      const newMap = new Map(state.activeHolds);
      newMap.delete(lane);
      return { activeHolds: newMap };
    });
    return hold;
  },

  getActiveHold: (lane) => {
    return get().activeHolds.get(lane);
  },

  isHolding: (lane) => {
    return get().activeHolds.has(lane);
  },

  clearAll: () => {
    set({ activeHolds: new Map() });
  },
}));
