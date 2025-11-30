import cn from "classnames";
import { memo } from "react";

import { Note as NoteType } from "@/shared/types/game/note";

import s from "./style.module.scss";

interface NoteProps {
  note: NoteType;
  position: number; // 0 ~ 1 (0: start, 1: end)
  noteDisplayTime: number;
  isHolding?: boolean; // 롱노트를 누르고 있는지 여부
}

const NoteComponent = ({
  note,
  position,
  noteDisplayTime,
  isHolding = false,
}: NoteProps) => {
  const style = {
    top: `${position * 100}%`,
  };

  if (note.type === "hold" && note.duration) {
    const height = (note.duration / noteDisplayTime) * 100;
    const tailStyle = {
      height: `${height}%`,
    };
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
};

export default memo(NoteComponent);
