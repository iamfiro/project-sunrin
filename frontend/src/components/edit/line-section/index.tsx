import { Note } from "@/shared/types/game/note";

import LineCard from "../line-card";

import s from "./style.module.scss";

interface Props {
  notes: Note[];
  measureStartTime: number;
  measureDuration: number;
}

export default function LineSection({
  notes,
  measureStartTime,
  measureDuration,
}: Props) {
  return (
    <div className={s.container}>
      <LineCard
        notes={notes.filter((note) => note.lane === 1)}
        lane={1}
        measureStartTime={measureStartTime}
        measureDuration={measureDuration}
      />
      <LineCard
        notes={notes.filter((note) => note.lane === 2)}
        lane={2}
        measureStartTime={measureStartTime}
        measureDuration={measureDuration}
      />
      <LineCard
        notes={notes.filter((note) => note.lane === 3)}
        lane={3}
        measureStartTime={measureStartTime}
        measureDuration={measureDuration}
      />
      <LineCard
        notes={notes.filter((note) => note.lane === 4)}
        lane={4}
        measureStartTime={measureStartTime}
        measureDuration={measureDuration}
      />
    </div>
  );
}
