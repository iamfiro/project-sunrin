import { useInputStore } from "@/store/inputStore";

import {
  useGameEnd,
  useGameTimer,
  useJudgement,
  useKeyboardInput,
  useMissDetection,
  useNoteGeneration,
  useNoteJudgement,
} from "../hooks";
import ComboDisplay from "../combo-display";
import Judgement from "../judgement";
import NoteField from "../note-field";

import s from "./style.module.scss";

export default function PlayField() {
  const { pressedKeys } = useInputStore();

  // 게임 타이머
  const { scroll, startTimeRef } = useGameTimer();

  // 노트 생성
  const { notes, setNotes, noteDisplayTime } = useNoteGeneration(scroll);

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
  useKeyboardInput(handleKeyPress);

  // Miss 자동 감지
  useMissDetection(scroll, notes, startTimeRef, showJudgement, setNotes);

  // 게임 종료
  useGameEnd(notes);

  return (
    <div className={s.container}>
      <ComboDisplay />
      <Judgement judgement={judgement} judgementId={judgementId} />
      <NoteField
        notes={notes}
        scroll={scroll}
        noteDisplayTime={noteDisplayTime}
        pressedKeys={pressedKeys}
      />
    </div>
  );
}
