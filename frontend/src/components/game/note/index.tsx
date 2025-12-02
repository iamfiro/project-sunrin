import cn from "classnames";
import { memo, useMemo } from "react";

import { Note as NoteType } from "@/shared/types/game/note";

import s from "./style.module.scss";

interface NoteProps {
  note: NoteType;
  position: number;
  noteDisplayTime: number;
  isHolding?: boolean;
  containerHeight?: number; // 컨테이너 높이 (픽셀)
}

const NoteComponent = memo(
  ({
    note,
    position,
    noteDisplayTime,
    isHolding = false,
    containerHeight = 600,
  }: NoteProps) => {
    const style = useMemo(() => ({ top: `${position * 100}%` }), [position]);

    // tail 높이를 픽셀로 계산 (컨테이너 높이 기준)
    const tailHeight = useMemo(() => {
      if (note.type === "hold" && note.duration) {
        // duration / noteDisplayTime = 컨테이너 높이에서 차지하는 비율
        // 이 비율 * containerHeight = 실제 픽셀 높이
        const height = (note.duration / noteDisplayTime) * containerHeight;
        return height;
      }
      return 0;
    }, [note.type, note.duration, noteDisplayTime, containerHeight]);

    const tailStyle = useMemo(
      () => ({
        height: `${tailHeight}px`,
      }),
      [tailHeight],
    );

    if (note.type === "hold" && note.duration) {
      return (
        <div
          className={cn(s.note, s.hold, { [s.pressing]: isHolding })}
          style={style}
        >
          <div className={s.tail} style={tailStyle}>
            <div className={s.tailEnd} />
          </div>
        </div>
      );
    }

    return <div className={s.note} style={style} />;
  },
  (prev, next) =>
    prev.position === next.position &&
    prev.isHolding === next.isHolding &&
    prev.note.id === next.note.id &&
    prev.note.duration === next.note.duration &&
    prev.containerHeight === next.containerHeight,
);

NoteComponent.displayName = "NoteComponent";

export default NoteComponent;
