import { memo, useMemo } from "react";

import { Note } from "@/shared/types/game/note";

import NoteLine from "../note-line";

import s from "./style.module.scss";

interface NoteFieldProps {
  notes: Note[];
  scroll: number;
  noteDisplayTime: number;
  pressedKeys: Set<number>;
}

const LANES = [0, 1, 2, 3] as const;

const NoteField = memo(
  ({ notes, scroll, noteDisplayTime, pressedKeys }: NoteFieldProps) => {
    // 레인별 노트 분리 (메모이제이션)
    const notesByLane = useMemo(() => {
      const result: Note[][] = [[], [], [], []];
      for (const note of notes) {
        if (note.lane >= 0 && note.lane < 4) {
          result[note.lane].push(note);
        }
      }
      return result;
    }, [notes]);

    // 키 눌림 상태 배열
    const pressedArray = useMemo(
      () => [
        pressedKeys.has(0),
        pressedKeys.has(1),
        pressedKeys.has(2),
        pressedKeys.has(3),
      ],
      [pressedKeys],
    );

    return (
      <div className={s.contents}>
        {LANES.map((lane) => (
          <NoteLine
            key={lane}
            lane={lane}
            notes={notesByLane[lane]}
            scroll={scroll}
            noteDisplayTime={noteDisplayTime}
            isKeyPressed={pressedArray[lane]}
          />
        ))}
      </div>
    );
  },
);

NoteField.displayName = "NoteField";

export default NoteField;
