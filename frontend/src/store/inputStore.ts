import { create } from "zustand";

type InputState = {
  // The array of 4 key codes (physical keys)
  keyCodes: [string, string, string, string];
  // Currently pressed keys (as indices)
  pressedKeys: Set<number>;
  // Set a key code at specific index (0-3)
  setKeyCode: (index: number, keyCode: string) => void;
  // Set all key codes at once
  setKeyCodes: (keyCodes: [string, string, string, string]) => void;
  // Handle key press
  pressKey: (keyIndex: number) => void;
  // Handle key release
  releaseKey: (keyIndex: number) => void;
  // Get pressed key codes
  getPressedKeyCodes: () => string[];
};

export const useInputStore = create<InputState>((set, get) => ({
  // Default keys: KeyD, KeyF, KeyJ, KeyK (physical keyboard codes)
  keyCodes: ["KeyD", "KeyF", "KeyJ", "KeyK"],
  pressedKeys: new Set<number>(),

  setKeyCode: (index, keyCode) =>
    set((state) => {
      const newKeyCodes = [...state.keyCodes] as [
        string,
        string,
        string,
        string,
      ];
      newKeyCodes[index] = keyCode;
      return { keyCodes: newKeyCodes };
    }),

  setKeyCodes: (keyCodes) => set({ keyCodes }),

  pressKey: (keyIndex) =>
    set((state) => {
      const newSet = new Set(state.pressedKeys);
      newSet.add(keyIndex);
      return { pressedKeys: newSet };
    }),

  releaseKey: (keyIndex) =>
    set((state) => {
      const newSet = new Set(state.pressedKeys);
      newSet.delete(keyIndex);
      return { pressedKeys: newSet };
    }),

  getPressedKeyCodes: () => {
    const { keyCodes, pressedKeys } = get();
    return Array.from(pressedKeys).map((idx) => keyCodes[idx]);
  },
}));
