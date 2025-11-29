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

export const useNoteStore = create<NoteState>((set, get) => {
  // Helper function for collision detection
  const createCollisionChecker = () => (
    targetLane: number,
    targetTime: number,
    movingNoteType: NoteType,
    movingNoteDuration: number | undefined,
    excludeNoteId: string | null = null, // ID of the note being moved/added, to exclude from collision checks
  ) => {
    const { notes } = get();
    const actualMovingNoteDuration = movingNoteType === "hold" ? (movingNoteDuration ?? 0) : 1;
    const movingNoteEndTime = targetTime + actualMovingNoteDuration;

    for (const otherNote of notes) {
      if (otherNote.id === excludeNoteId) continue;
      if (otherNote.lane !== targetLane) continue;

      const otherNoteActualDuration = otherNote.type === "hold" ? (otherNote.duration ?? 0) : 1;
      const otherNoteEndTime = otherNote.time + otherNoteActualDuration;

      if (targetTime < otherNoteEndTime && movingNoteEndTime > otherNote.time) {
        return otherNote; // Found collision
      }
    }
    return null;
  };

  const checkCollision = createCollisionChecker();

  return {
    notes: [],
    selectedNoteId: null,
    addNote: (note) => {
      const newNoteId = `note_${Date.now()}_${Math.random()}`;

      let targetLane = note.lane;
      let targetTime = note.time;
      const measureDuration = 500;

      let foundSpot = false;

      while (!foundSpot) {
        // Check lanes 1-4 at the current targetTime
        for (let i = 1; i <= 4; i++) {
          const collidingNote = checkCollision(
            i,
            targetTime,
            note.type,
            note.duration,
            null, // No note to exclude since we are adding a new one
          );
          if (!collidingNote) {
            targetLane = i;
            foundSpot = true;
            break; // Exit the for loop
          }
        }

        if (!foundSpot) {
          // All lanes at targetTime were full. Move to the same position in the next measure.
          const relativeTime = targetTime % measureDuration;
          const currentMeasureStart = targetTime - relativeTime;
          targetTime = currentMeasureStart + measureDuration + relativeTime;
        }
      }

      set((state) => ({
        notes: [
          ...state.notes,
          { ...note, id: newNoteId, lane: targetLane, time: targetTime },
        ],
        selectedNoteId: newNoteId,
      }));
    },
    removeNote: (noteId) =>
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== noteId),
        selectedNoteId:
          state.selectedNoteId === noteId ? null : state.selectedNoteId,
      })),
    updateNote: (noteId, updates) => {
      const { notes } = get();
      const noteToUpdate = notes.find((note) => note.id === noteId);

      if (!noteToUpdate) {
        return;
      }

      if (updates.lane === undefined && updates.time === undefined) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId ? { ...note, ...updates } : note,
          ),
        }));
        return;
      }

      let newLane = updates.lane ?? noteToUpdate.lane;
      let newTime = updates.time ?? noteToUpdate.time;
      const originalLane = noteToUpdate.lane;
      const originalTime = noteToUpdate.time;

      let collidingNote = checkCollision(newLane, newTime, noteToUpdate.type, noteToUpdate.duration, noteId);

      if (collidingNote) {
        if (updates.lane !== undefined) {
          // Horizontal move
          const laneStep = Math.sign(newLane - originalLane);
          if (laneStep === 0) {
            return; // At a boundary with collision, block
          }
          while (collidingNote) {
            newLane += laneStep;
            if (newLane < 1 || newLane > 4) {
              return;
            }
            collidingNote = checkCollision(newLane, newTime, noteToUpdate.type, noteToUpdate.duration, noteId);
          }
        } else if (updates.time !== undefined) {
          // Vertical move
          const measureDuration = 500;
          const timeDirection = Math.sign(newTime - originalTime);
          if (timeDirection === 0) {
            return; // At a boundary with collision, block
          }
          while (collidingNote) {
            newTime += timeDirection * measureDuration;
            if (newTime < 0) {
              return;
            }
            collidingNote = checkCollision(newLane, newTime, noteToUpdate.type, noteToUpdate.duration, noteId);
          }
        }
      }

      const finalUpdates = { ...updates, lane: newLane, time: newTime };
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId ? { ...note, ...finalUpdates } : note,
        ),
      }));
    },
    selectNote: (noteId) => set({ selectedNoteId: noteId }),
    getSelectedNote: () => {
      const { notes, selectedNoteId } = get();
      return notes.find((note) => note.id === selectedNoteId);
    },
  };
});
