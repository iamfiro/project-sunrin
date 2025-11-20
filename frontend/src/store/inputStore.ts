import { create } from 'zustand';

type InputState = {
  // The array of 4 keys
  keys: [string, string, string, string];
  // Currently pressed keys (as indices)
  pressedKeys: Set<number>;
  // Set a key at specific index (0-3)
  setKey: (index: number, key: string) => void;
  // Set all keys at once
  setKeys: (keys: [string, string, string, string]) => void;
  // Handle key press
  pressKey: (keyIndex: number) => void;
  // Handle key release
  releaseKey: (keyIndex: number) => void;
  // Get pressed key names
  getPressedKeyNames: () => string[];
};

export const useInputStore = create<InputState>((set, get) => ({
  // Default keys: d, f, j, k
  keys: ['d', 'f', 'j', 'k'],
  pressedKeys: new Set<number>(),
  
  setKey: (index, key) => 
    set((state) => {
      const newKeys = [...state.keys] as [string, string, string, string];
      newKeys[index] = key;
      return { keys: newKeys };
    }),
    
  setKeys: (keys) => set({ keys }),
  
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
    
  getPressedKeyNames: () => {
    const { keys, pressedKeys } = get();
    return Array.from(pressedKeys).map(idx => keys[idx]);
  },
}));
