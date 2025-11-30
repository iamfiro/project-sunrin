import { create } from "zustand";

interface EditorStore {
  editTitle: string;
  setEditTitle: (title: string) => void;
  editMusic: File | null;
  setEditMusic: (music: File | null) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  editVideoUrl: string | null;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  editTitle: "",
  setEditTitle: (title: string) => set({ editTitle: title }),
  editMusic: null,
  setEditMusic: (music: File | null) => {
    const { editVideoUrl } = get();
    if (editVideoUrl) {
      URL.revokeObjectURL(editVideoUrl);
    }

    if (music && music.type.startsWith("video/")) {
      const url = URL.createObjectURL(music);
      set({ editMusic: music, editVideoUrl: url });
    } else {
      set({ editMusic: music, editVideoUrl: null });
    }
  },
  bpm: 0,
  setBpm: (bpm: number) => set({ bpm }),
  editVideoUrl: null,
}));
