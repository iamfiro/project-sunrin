import { create } from "zustand";

import { Note } from "@/shared/types/game/note";

interface NoteState {
  notes: Note[];
  selectedNoteId: string | null;
  addNote: (note: Omit<Note, "id">) => void;
  removeNote: (noteId: string) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  selectNote: (noteId: string | null) => void;
  getSelectedNote: () => Note | undefined;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  addNote: (note) =>
    set((state) => ({
      notes: [
        ...state.notes,
        { ...note, id: `note_${Date.now()}_${Math.random()}` },
      ],
    })),
  removeNote: (noteId) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== noteId),
      selectedNoteId:
        state.selectedNoteId === noteId ? null : state.selectedNoteId,
    })),
  updateNote: (noteId, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId ? { ...note, ...updates } : note,
      ),
    })),
  selectNote: (noteId) => set({ selectedNoteId: noteId }),
  getSelectedNote: () => {
    const { notes, selectedNoteId } = get();
    return notes.find((note) => note.id === selectedNoteId);
  },
}));
