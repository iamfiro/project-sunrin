import cn from "classnames";
import { memo, useMemo } from "react";

import { Note } from "@/shared/types/game/note";
import { useHoldNoteStore } from "@/store/useHoldNoteStore";

import NoteComponent from "../note";

import s from "./style.module.scss";

interface NoteLineProps {
  lane: number;
  notes: Note[];
  scroll: number;
  noteDisplayTime: number;
  isKeyPressed: boolean;
}

// 화면 위 밖에서 노트가 나타나도록 여유 공간
const TOP_MARGIN_RATIO = 0.1;

const NoteLine = memo(
  ({ lane, notes, scroll, noteDisplayTime, isKeyPressed }: NoteLineProps) => {
    const { activeHolds } = useHoldNoteStore();
    const activeHold = activeHolds.get(lane);

    // 화면 위 밖에서부터 노트가 보이도록 범위 확장
    const extendedDisplayTime = noteDisplayTime * (1 + TOP_MARGIN_RATIO);

    // 보이는 노트만 필터링 (메모이제이션)
    const visibleNotes = useMemo(() => {
      return notes.filter((note) => {
        const noteTime = note.time;
        const noteEndTime =
          note.type === "hold" && note.duration
            ? noteTime + note.duration
            : noteTime;
        return (
          noteEndTime >= scroll && noteTime <= scroll + extendedDisplayTime
        );
      });
    }, [notes, scroll, extendedDisplayTime]);

    return (
      <div className={cn(s.container, { [s.keyPressed]: isKeyPressed })}>
        {visibleNotes.map((note) => {
          const position = 1 - (note.time - scroll) / noteDisplayTime;
          const isHolding =
            note.type === "hold" &&
            activeHold?.noteId === note.id &&
            isKeyPressed;

          return (
            <NoteComponent
              key={note.id}
              note={note}
              position={position}
              noteDisplayTime={noteDisplayTime}
              isHolding={isHolding}
            />
          );
        })}
      </div>
    );
  },
);

NoteLine.displayName = "NoteLine";

export default NoteLine;
