import { create } from "zustand";

interface EditorStore {
  editTitle: string;
  setEditTitle: (title: string) => void;
  editMusic: File | null;
  setEditMusic: (music: File | null) => void;
  coverImage: File | null;
  setCoverImage: (cover: File | null) => void;
  coverPreviewUrl: string | null;
  bpm: number;
  setBpm: (bpm: number) => void;
  artist: string;
  setArtist: (artist: string) => void;
  difficulty: number;
  setDifficulty: (difficulty: number) => void;
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
  coverImage: null,
  setCoverImage: (cover: File | null) => {
    const { coverPreviewUrl } = get();
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    if (cover) {
      const url = URL.createObjectURL(cover);
      set({ coverImage: cover, coverPreviewUrl: url });
    } else {
      set({ coverImage: null, coverPreviewUrl: null });
    }
  },
  coverPreviewUrl: null,
  bpm: 0,
  setBpm: (bpm: number) => set({ bpm }),
  artist: "",
  setArtist: (artist: string) => set({ artist }),
  difficulty: 1,
  setDifficulty: (difficulty: number) => set({ difficulty }),
  editVideoUrl: null,
}));
