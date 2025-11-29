import cn from "classnames";
import { useRef } from "react";

import { Note } from "@/shared/types/game/note";
import { useNoteStore } from "@/store/useNoteStore";

import s from "./style.module.scss";

interface Props {
  notes: Note[];
  lane: number;
  measureStartTime: number;
  measureDuration: number;
}

export default function LineCard({
  notes,
  measureStartTime,
  measureDuration,
}: Props) {
  const { selectedNoteId, selectNote, updateNote } = useNoteStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for tracking resize operation
  const resizingNoteRef = useRef<Note | null>(null);
  const noteElementRef = useRef<HTMLDivElement | null>(null);

  const getNotePosition = (noteTime: number) => {
    const relativeTime = noteTime - measureStartTime;
    return (relativeTime / measureDuration) * 100; // Returns percentage for 'top'
  };

  const getNoteLength = (duration: number) => {
    return (duration / measureDuration) * 100; // Returns percentage for 'width'
  };

  // --- Resize Handlers ---

  const handleResizeStart = (e: React.PointerEvent, note: Note) => {
    e.stopPropagation();
    resizingNoteRef.current = note;
    noteElementRef.current = (e.target as HTMLElement)
      .parentElement as HTMLDivElement;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (
      !resizingNoteRef.current ||
      !containerRef.current ||
      !noteElementRef.current
    )
      return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const noteElement = noteElementRef.current;

    // Calculate new width based on horizontal mouse movement
    const noteLeftX = containerRect.left; // Long notes start at left edge of LineCard
    let newWidth = e.clientX - noteLeftX;

    if (newWidth < 12) newWidth = 12; // Minimum width for the horizontal note

    // Directly update the DOM for a smooth visual preview
    noteElement.style.width = `${newWidth}px`;
  };

  const handlePointerUp = () => {
    if (
      !resizingNoteRef.current ||
      !containerRef.current ||
      !noteElementRef.current
    )
      return;

    const note = resizingNoteRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();
    const finalWidth = parseFloat(noteElementRef.current.style.width);

    // Calculate final duration from width and update the store once
    const newDuration = (finalWidth / containerRect.width) * measureDuration;
    updateNote(note.id, { duration: Math.round(newDuration) });

    // Cleanup
    resizingNoteRef.current = null;
    noteElementRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      ref={containerRef}
      className={s.container}
      onClick={() => selectNote(null)}
    >
      {notes.map((note) => {
        const top = getNotePosition(note.time);
        const isSelected = note.id === selectedNoteId;

        const noteClasses = cn(s.noteBase, {
          [s.note]: note.type === "tap",
          [s.longNote]: note.type === "hold",
          [s.selected]: isSelected,
        });

        const handleNoteClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          selectNote(isSelected ? null : note.id);
        };

        if (note.type === "hold") {
          const width = getNoteLength(note.duration || 0); // Use width for duration

          return (
            <div
              key={note.id}
              className={noteClasses}
              style={{
                top: `${top}%`,
                width: `${width}%`,
              }}
              onClick={handleNoteClick}
            >
              <div className={s.noteCap} />
              <div className={s.noteBody} />
              <div
                className={s.noteEnd}
                onPointerDown={(e) => handleResizeStart(e, note)}
              />
            </div>
          );
        }

        return (
          <div
            key={note.id}
            className={noteClasses}
            style={{ top: `${top}%` }}
            onClick={handleNoteClick}
          />
        );
      })}
    </div>
  );
}
