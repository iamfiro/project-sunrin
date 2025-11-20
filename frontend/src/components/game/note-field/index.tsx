import { memo } from 'react';
import { Note } from '@/shared/types/game/note';
import NoteLine from '../note-line';
import s from './style.module.scss';

interface NoteFieldProps {
  notes: Note[];
  scroll: number;
  noteDisplayTime: number;
  pressedKeys: Set<number>;
}

const NoteField = ({ notes, scroll, noteDisplayTime, pressedKeys }: NoteFieldProps) => {
  const getNotesForLane = (lane: number) => {
    return notes.filter(note => note.lane === lane);
  };

  return (
    <div className={s.contents}>
      <NoteLine lane={0} notes={getNotesForLane(0)} scroll={scroll} noteDisplayTime={noteDisplayTime} pressedKeys={pressedKeys} />
      <NoteLine lane={1} notes={getNotesForLane(1)} scroll={scroll} noteDisplayTime={noteDisplayTime} pressedKeys={pressedKeys} />
      <NoteLine lane={2} notes={getNotesForLane(2)} scroll={scroll} noteDisplayTime={noteDisplayTime} pressedKeys={pressedKeys} />
      <NoteLine lane={3} notes={getNotesForLane(3)} scroll={scroll} noteDisplayTime={noteDisplayTime} pressedKeys={pressedKeys} />
    </div>
  );
};

export default memo(NoteField);
