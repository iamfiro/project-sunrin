import cn from "classnames";
import { memo, useMemo } from "react";

import { Note as NoteType } from "@/shared/types/game/note";

import s from "./style.module.scss";

interface NoteProps {
  note: NoteType;
  position: number;
  noteDisplayTime: number;
  isHolding?: boolean;
}

const NoteComponent = memo(
  ({ note, position, noteDisplayTime, isHolding = false }: NoteProps) => {
    const style = useMemo(() => ({ top: `${position * 100}%` }), [position]);

    if (note.type === "hold" && note.duration) {
      const tailStyle = useMemo(
        () => ({ height: `${(note.duration! / noteDisplayTime) * 100}%` }),
        [note.duration, noteDisplayTime],
      );

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
    prev.note.id === next.note.id,
);

NoteComponent.displayName = "NoteComponent";

export default NoteComponent;
