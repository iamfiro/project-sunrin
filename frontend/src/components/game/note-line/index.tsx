import cn from "classnames";
import { memo } from "react";

import { Note } from "@/shared/types/game/note";
import { useHoldNoteStore } from "@/store/useHoldNoteStore";

import NoteComponent from "../note";

import s from "./style.module.scss";

interface NoteLineProps {
  lane: number;
  notes: Note[];
  scroll: number;
  noteDisplayTime: number;
  pressedKeys: Set<number>;
}

// 화면 위 밖에서 노트가 나타나도록 여유 공간 (노트 높이만큼)
const TOP_MARGIN_RATIO = 0.1; // 10% 여유

const NoteLine = ({
  lane,
  notes,
  scroll,
  noteDisplayTime,
  pressedKeys,
}: NoteLineProps) => {
  const { activeHolds } = useHoldNoteStore();
  const activeHold = activeHolds.get(lane);

  // 화면 위 밖에서부터 노트가 보이도록 범위 확장
  const extendedDisplayTime = noteDisplayTime * (1 + TOP_MARGIN_RATIO);

  const visibleNotes = notes.filter((note) => {
    const noteTime = note.time;
    // 롱노트인 경우 duration까지 고려
    const noteEndTime =
      note.type === "hold" && note.duration
        ? noteTime + note.duration
        : noteTime;
    // 화면 위쪽 밖(scroll + extendedDisplayTime)까지 포함
    const isVisible =
      noteEndTime >= scroll && noteTime <= scroll + extendedDisplayTime;
    return isVisible;
  });

  const isKeyPressed = pressedKeys.has(lane);

  return (
    <div className={cn(s.container, { [s.keyPressed]: isKeyPressed })}>
      {visibleNotes.map((note) => {
        // position: 0 = 화면 위, 1 = 판정선, 음수 = 화면 위 밖
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
};

export default memo(NoteLine);
