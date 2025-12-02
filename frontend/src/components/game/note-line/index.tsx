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
  allNotes?: Note[]; // 원본 노트 배열 (활성 롱노트 정보용)
  containerHeight: number; // 컨테이너 높이 (픽셀)
}

// 화면 위 밖에서 노트가 나타나도록 여유 공간
const TOP_MARGIN_RATIO = 0.1;

const NoteLine = memo(
  ({
    lane,
    notes,
    scroll,
    noteDisplayTime,
    isKeyPressed,
    allNotes = [],
    containerHeight,
  }: NoteLineProps) => {
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

    // 활성화된 롱노트 찾기 (notes에서 제거되었지만 아직 진행 중인 롱노트)
    const activeHoldNote = useMemo(() => {
      if (!activeHold) return null;
      // allNotes나 notes에서 활성 롱노트 찾기
      const fromAll = allNotes.find((n) => n.id === activeHold.noteId);
      if (fromAll) return fromAll;
      // notes에서도 찾아보기 (아직 제거되지 않은 경우)
      return notes.find((n) => n.id === activeHold.noteId) || null;
    }, [activeHold, allNotes, notes]);

    // 활성화된 롱노트의 남은 duration 계산
    const activeHoldRemainingDuration = useMemo(() => {
      if (!activeHold || !activeHoldNote) return 0;
      const remainingTime = activeHold.endTime - scroll;
      return Math.max(0, remainingTime);
    }, [activeHold, activeHoldNote, scroll]);

    return (
      <div className={cn(s.container, { [s.keyPressed]: isKeyPressed })}>
        {/* 일반 노트들 렌더링 */}
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
              containerHeight={containerHeight}
            />
          );
        })}

        {/* 활성화된 롱노트 (notes에서 제거된 경우) 별도 렌더링 */}
        {activeHoldNote &&
          !visibleNotes.find((n) => n.id === activeHoldNote.id) &&
          activeHoldRemainingDuration > 0 && (
            <NoteComponent
              key={`active-${activeHoldNote.id}`}
              note={{
                ...activeHoldNote,
                duration: activeHoldRemainingDuration, // 남은 duration으로 업데이트
              }}
              position={1} // 활성화된 롱노트는 판정선(하단)에 고정
              noteDisplayTime={noteDisplayTime}
              isHolding={isKeyPressed}
              containerHeight={containerHeight}
            />
          )}
      </div>
    );
  },
);

NoteLine.displayName = "NoteLine";

export default NoteLine;
