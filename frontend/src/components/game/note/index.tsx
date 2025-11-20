
import s from "./style.module.scss";
import { Note as NoteType } from "@/shared/types/game/note";
import { memo } from "react";
import cn from "classnames";

interface NoteProps {
  note: NoteType;
  position: number; // 0 ~ 1 (0: start, 1: end)
  noteDisplayTime: number;
}

const NoteComponent = ({ note, position, noteDisplayTime }: NoteProps) => {
  const style = {
    top: `${position * 100}%`,
  };

  if (note.type === 'hold' && note.duration) {
    const height = (note.duration / noteDisplayTime) * 100;
    const tailStyle = {
        height: `${height}%`,
    }
    return (
        <div className={cn(s.note, s.hold)} style={style}>
            <div className={s.tail} style={tailStyle}></div>
        </div>
    )
  }

  return <div className={s.note} style={style} />;
};

export default memo(NoteComponent);
