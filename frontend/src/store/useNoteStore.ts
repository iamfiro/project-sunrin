import { create } from "zustand";

import { Note, NoteType } from "@/shared/types/game/note";

interface NoteHistory {
  notes: Note[];
  selectedNoteId: string | null;
}

interface NoteState extends NoteHistory {
  past: NoteHistory[];
  future: NoteHistory[];

  addNote: (note: Omit<Note, "id">) => void;
  removeNote: (noteId: string) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  selectNote: (noteId: string | null) => void;
  getSelectedNote: () => Note | undefined;

  undo: () => void;
  redo: () => void;
}

export const useNoteStore = create<NoteState>((set, get) => {
  const createCollisionChecker = () => (
    targetLane: number,
    targetTime: number,
    movingNoteType: NoteType,
    movingNoteDuration: number | undefined,
    excludeNoteId: string | null = null,
  ) => {
    const { notes } = get();
    const actualMovingNoteDuration = movingNoteType === "hold" ? movingNoteDuration ?? 0 : 1;
    const movingNoteEndTime = targetTime + actualMovingNoteDuration;

    for (const otherNote of notes) {
      if (otherNote.id === excludeNoteId) continue;
      if (otherNote.lane !== targetLane) continue;

      const otherNoteActualDuration = otherNote.type === "hold" ? otherNote.duration ?? 0 : 1;
      const otherNoteEndTime = otherNote.time + otherNoteActualDuration;

      if (targetTime < otherNoteEndTime && movingNoteEndTime > otherNote.time) {
        return otherNote;
      }
    }
    return null;
  };

  const checkCollision = createCollisionChecker();

  const recordAndSet = (setter: (state: NoteState) => Partial<NoteState>) => {
    set((state) => {
      const { notes, selectedNoteId, past } = state;
      const newPast = [...past, { notes, selectedNoteId }];
      const newValues = setter(state);
      return { ...newValues, past: newPast, future: [] };
    });
  };

  return {
    notes: [],
    selectedNoteId: null,
    past: [],
    future: [],

    addNote: (note) => {
      recordAndSet((state) => {
        const newNoteId = `note_${Date.now()}_${Math.random()}`;
        let targetLane = note.lane;
        let targetTime = note.time;
        const measureDuration = 500;
        let foundSpot = false;

        while (!foundSpot) {
          for (let i = 1; i <= 4; i++) {
            const collidingNote = checkCollision(i, targetTime, note.type, note.duration, null);
            if (!collidingNote) {
              targetLane = i;
              foundSpot = true;
              break;
            }
          }

          if (!foundSpot) {
            const relativeTime = targetTime % measureDuration;
            const currentMeasureStart = targetTime - relativeTime;
            targetTime = currentMeasureStart + measureDuration + relativeTime;
          }
        }
        return {
          notes: [...state.notes, { ...note, id: newNoteId, lane: targetLane, time: targetTime }],
          selectedNoteId: newNoteId,
        };
      });
    },

    removeNote: (noteId) => {
      recordAndSet((state) => ({
        notes: state.notes.filter((note) => note.id !== noteId),
        selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
      }));
    },

    updateNote: (noteId, updates) => {
      const { notes, selectedNoteId } = get();
      const noteToUpdate = notes.find((note) => note.id === noteId);
      if (!noteToUpdate) return;
      
      let newLane = updates.lane ?? noteToUpdate.lane;
      let newTime = updates.time ?? noteToUpdate.time;

      if (updates.lane !== undefined || updates.time !== undefined) {
        const originalLane = noteToUpdate.lane;
        const originalTime = noteToUpdate.time;
        let collidingNote = checkCollision(newLane, newTime, noteToUpdate.type, noteToUpdate.duration, noteId);
        if (collidingNote) {
          if (updates.lane !== undefined) {
            const laneStep = Math.sign(newLane - originalLane);
            if (laneStep === 0) return;
            while (collidingNote) {
              newLane += laneStep;
              if (newLane < 1 || newLane > 4) return;
              collidingNote = checkCollision(newLane, newTime, noteToUpdate.type, noteToUpdate.duration, noteId);
            }
          } else if (updates.time !== undefined) {
            const measureDuration = 500;
            const timeDirection = Math.sign(newTime - originalTime);
            if (timeDirection === 0) return;
            while (collidingNote) {
              newTime += timeDirection * measureDuration;
              if (newTime < 0) return;
              collidingNote = checkCollision(newLane, newTime, noteToUpdate.type, noteToUpdate.duration, noteId);
            }
          }
        }
      }
      
      const finalUpdates = { ...updates, lane: newLane, time: newTime };
      
      recordAndSet(() => ({
          notes: notes.map((note) =>
            note.id === noteId ? { ...note, ...finalUpdates } : note,
          ),
          selectedNoteId,
      }));
    },

    selectNote: (noteId) => {
        recordAndSet(() => ({
            selectedNoteId: noteId,
        }));
    },

    getSelectedNote: () => {
      const { notes, selectedNoteId } = get();
      return notes.find((note) => note.id === selectedNoteId);
    },

    undo: () => {
      set((state) => {
        const { past, future, notes, selectedNoteId } = state;
        if (past.length === 0) return {};
        const previousState = past[past.length - 1];
        return {
          past: past.slice(0, past.length - 1),
          future: [{ notes, selectedNoteId }, ...future],
          notes: previousState.notes,
          selectedNoteId: previousState.selectedNoteId,
        };
      });
    },

    redo: () => {
      set((state) => {
        const { past, future, notes, selectedNoteId } = state;
        if (future.length === 0) return {};
        const nextState = future[0];
        return {
          past: [...past, { notes, selectedNoteId }],
          future: future.slice(1),
          notes: nextState.notes,
          selectedNoteId: nextState.selectedNoteId,
        };
      });
    },
  };
});
