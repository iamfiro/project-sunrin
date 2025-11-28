import cn from "classnames";

import { Note } from "@/shared/types/game/note";

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
  const getNotePosition = (noteTime: number) => {
    const relativeTime = noteTime - measureStartTime;
    return (relativeTime / measureDuration) * 100;
  };

  const getNoteHeight = (duration: number) => {
    return (duration / measureDuration) * 100;
  };

  return (
    <div className={s.container}>
      {notes.map((note) => {
        const top = getNotePosition(note.time);
        if (note.type === "hold") {
          const height = getNoteHeight(note.duration || 0);
          return (
            <div
              key={note.id}
              className={cn(s.note, s.longNote)}
              style={{ left: `${top}%`, width: `${height}%` }}
            />
          );
        }
        return (
          <div key={note.id} className={s.note} style={{ left: `${top}%` }} />
        );
      })}
    </div>
  );
}
