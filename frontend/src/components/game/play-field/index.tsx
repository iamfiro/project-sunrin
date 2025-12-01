import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Note } from "@/shared/types/game/note";
import { useInputStore } from "@/store/inputStore";
import { useHitEffectStore } from "@/store/useHitEffectStore";

import ComboDisplay from "../combo-display";
import HitEffect from "../hit-effect";
import {
  useGameEnd,
  useGameTimer,
  useJudgement,
  useKeyboardInput,
  useMissDetection,
  useNoteJudgement,
} from "../hooks";
import Judgement from "../judgement";
import KeyPressIndicator from "../key-press-indicator";
import NoteField from "../note-field";

import s from "./style.module.scss";

const LANE_POSITIONS = [12.5, 37.5, 62.5, 87.5];
const NOTE_DISPLAY_TIME = 600;

interface PlayFieldProps {
  notes: Note[];
  onGameStarted?: (isStarted: boolean) => void;
  onVideoEndCallback?: (handler: () => void) => void;
}

export default function PlayField({
  notes: initialNotes,
  onGameStarted,
  onVideoEndCallback,
}: PlayFieldProps) {
  const { pressedKeys } = useInputStore();
  const { effects, removeEffect } = useHitEffectStore();

  const { scroll, startTimeRef, countdown, isGameStarted } = useGameTimer();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    onGameStarted?.(isGameStarted);
  }, [isGameStarted, onGameStarted]);

  useEffect(() => {
    if (isGameStarted && initialNotes.length > 0 && notes.length === 0) {
      const adjustedNotes = initialNotes.map((note) => ({
        ...note,
        time: note.time + NOTE_DISPLAY_TIME,
      }));
      setNotes(adjustedNotes);
    }
  }, [isGameStarted, initialNotes, notes.length]);

  const { judgement, judgementId, showJudgement } = useJudgement();

  const { handleKeyPress } = useNoteJudgement(
    notes,
    startTimeRef,
    showJudgement,
    setNotes,
  );

  useKeyboardInput(handleKeyPress, isGameStarted);

  useMissDetection(scroll, notes, startTimeRef, showJudgement, setNotes);

  const { handleVideoEnd } = useGameEnd(notes);

  useEffect(() => {
    onVideoEndCallback?.(handleVideoEnd);
  }, [handleVideoEnd, onVideoEndCallback]);

  return (
    <>
      {!isGameStarted &&
        createPortal(
          <div className={s.countdownOverlay}>
            <span className={s.countdownText}>
              {countdown > 0 ? countdown : "START!"}
            </span>
          </div>,
          document.body,
        )}

      <div className={s.container}>
        <ComboDisplay />
        <Judgement judgement={judgement} judgementId={judgementId} />
        <NoteField
          notes={notes}
          scroll={scroll}
          noteDisplayTime={NOTE_DISPLAY_TIME}
          pressedKeys={pressedKeys}
        />

        {effects.map((effect) => (
          <HitEffect
            key={effect.id}
            judgement={effect.judgement}
            position={LANE_POSITIONS[effect.lane]}
            show={true}
            onComplete={() => removeEffect(effect.id)}
          />
        ))}
        <KeyPressIndicator pressedKeys={pressedKeys} />
      </div>
    </>
  );
}
