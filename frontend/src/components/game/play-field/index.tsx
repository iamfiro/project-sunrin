import { useEffect } from "react";

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
  useNoteGeneration,
  useNoteJudgement,
} from "../hooks";
import Judgement from "../judgement";
import KeyPressIndicator from "../key-press-indicator";
import NoteField from "../note-field";

import s from "./style.module.scss";

const LANE_POSITIONS = [12.5, 37.5, 62.5, 87.5];

interface PlayFieldProps {
  onGameStarted?: (isStarted: boolean) => void;
  onVideoEndCallback?: (handler: () => void) => void;
}

export default function PlayField({
  onGameStarted,
  onVideoEndCallback,
}: PlayFieldProps) {
  const { pressedKeys } = useInputStore();
  const { effects, removeEffect } = useHitEffectStore();

  const { scroll, startTimeRef, countdown, isGameStarted } = useGameTimer();

  useEffect(() => {
    onGameStarted?.(isGameStarted);
  }, [isGameStarted, onGameStarted]);

  const { notes, setNotes, noteDisplayTime } = useNoteGeneration(
    scroll,
    isGameStarted,
  );

  // 판정 표시
  const { judgement, judgementId, showJudgement } = useJudgement();

  // 노트 판정 처리
  const { handleKeyPress } = useNoteJudgement(
    notes,
    startTimeRef,
    showJudgement,
    setNotes,
  );

  // 키보드 입력
  useKeyboardInput(handleKeyPress, isGameStarted);

  // Miss 자동 감지
  useMissDetection(scroll, notes, startTimeRef, showJudgement, setNotes);

  // 게임 종료
  const { handleVideoEnd } = useGameEnd(notes);

  // 비디오 종료 핸들러를 부모에게 전달
  useEffect(() => {
    onVideoEndCallback?.(handleVideoEnd);
  }, [handleVideoEnd, onVideoEndCallback]);

  return (
    <div className={s.container}>
      {!isGameStarted && (
        <div className={s.countdownOverlay}>
          <span className={s.countdownText}>
            {countdown > 0 ? countdown : "START!"}
          </span>
        </div>
      )}
      <ComboDisplay />
      <Judgement judgement={judgement} judgementId={judgementId} />
      <NoteField
        notes={notes}
        scroll={scroll}
        noteDisplayTime={noteDisplayTime}
        pressedKeys={pressedKeys}
      />

      {/* 판정 이펙트 (여러 개 동시 렌더링) */}
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
  );
}
