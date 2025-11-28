import { create } from "zustand";

interface EditorStore {
  editTitle: string;
  setEditTitle: (title: string) => void;
  editMusic: File | null;
  setEditMusic: (music: File | null) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  editTitle: "",
  setEditTitle: (title: string) => set({ editTitle: title }),
  editMusic: null,
  setEditMusic: (music: File | null) => set({ editMusic: music }),
  bpm: 0,
  setBpm: (bpm: number) => set({ bpm }),
}));
