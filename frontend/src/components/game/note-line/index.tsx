import cn from "classnames"; // Import classnames
import { memo } from "react";

import { Note } from "@/shared/types/game/note";

import NoteComponent from "../note";

import s from "./style.module.scss";

interface NoteLineProps {
  lane: number;
  notes: Note[];
  scroll: number;
  noteDisplayTime: number;
  pressedKeys: Set<number>; // Add pressedKeys to props
}

const NoteLine = ({
  lane,
  notes,
  scroll,
  noteDisplayTime,
  pressedKeys,
}: NoteLineProps) => {
  const visibleNotes = notes.filter((note) => {
    const noteTime = note.time;
    const isVisible =
      noteTime >= scroll && noteTime <= scroll + noteDisplayTime;
    return isVisible;
  });

  const isKeyPressed = pressedKeys.has(lane); // Check if current lane's key is pressed

  return (
    <div className={cn(s.container, { [s.keyPressed]: isKeyPressed })}>
      {" "}
      {/* Apply class conditionally */}
      {visibleNotes.map((note) => {
        const position = 1 - (note.time - scroll) / noteDisplayTime;
        return (
          <NoteComponent
            key={note.id}
            note={note}
            position={position}
            noteDisplayTime={noteDisplayTime}
          />
        );
      })}
    </div>
  );
};

export default memo(NoteLine);
