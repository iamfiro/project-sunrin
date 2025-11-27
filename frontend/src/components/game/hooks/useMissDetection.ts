import { useEffect } from "react";

import { Note } from "@/shared/types/game/note";
import { useResultStore } from "@/store/useResultStore";

const JUDGEMENT_WINDOWS = {
  perfect: 30,
  great: 60,
  good: 100,
  miss: 150,
};

const calculateAccuracy = (
  perfect: number,
  great: number,
  good: number,
  bad: number,
  miss: number,
): number => {
  const total = perfect + great + good + bad + miss;
  if (total === 0) return 0;

  const weightedSum =
    (perfect * 1.0 + great * 0.8 + good * 0.5 + bad * 0.2) * 100;
  return Math.round(weightedSum / total);
};

const calculateRank = (
  accuracy: number,
  perfect: number,
  totalNotes: number,
): "F" | "D" | "C" | "B" | "A" | "S" | "SS" | undefined => {
  if (accuracy >= 99.5) {
    if (perfect === totalNotes) return "SS";
    if (perfect >= totalNotes * 0.95) return "SS";
    return "S";
  }
  if (accuracy >= 95) return "A";
  if (accuracy >= 90) return "B";
  if (accuracy >= 85) return "C";
  return "D";
};

const updateCombo = (
  currentCombo: string[],
  currentTime: number,
  isComboBreak: boolean = false,
) => {
  if (currentCombo.length === 0) {
    return [`${currentTime}-${currentTime}-1`];
  }

  const lastCombo = currentCombo[currentCombo.length - 1];
  const [startTime, , count] = lastCombo.split("-").map(Number);

  if (isComboBreak) {
    return [...currentCombo, `${currentTime}-${currentTime}-1`];
  }
  const updatedCombo = [...currentCombo];
  updatedCombo[updatedCombo.length - 1] =
    `${startTime}-${currentTime}-${count + 1}`;
  return updatedCombo;
};

/**
 * Miss 노트 자동 감지 및 처리
 */
export const useMissDetection = (
  scroll: number,
  notes: Note[],
  startTimeRef: React.RefObject<number>,
  showJudgement: (judgement: string) => void,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
) => {
  const { setResult, getResult } = useResultStore();

  useEffect(() => {
    const missedNotes = notes.filter(
      (note) => scroll > note.time + JUDGEMENT_WINDOWS.miss,
    );

    if (missedNotes.length > 0) {
      // 자동 감지된 Miss는 판정 표시하지 않음 (사용자가 키를 눌렀을 때만 표시)
      // showJudgement("Miss");

      const current = getResult();
      const newMissCount = current.miss + missedNotes.length;

      const accuracy = calculateAccuracy(
        current.perfect,
        current.great,
        current.good,
        0,
        newMissCount,
      );
      const totalNotes =
        current.perfect + current.great + current.good + newMissCount;
      const rank = calculateRank(accuracy, current.perfect, totalNotes);

      setResult({
        miss: newMissCount,
        combo: updateCombo(
          current.combo,
          performance.now() - startTimeRef.current!,
          true,
        ),
        accuracy,
        rank,
        isFullCombo: false,
        isAllPerfect: false,
      });

      setNotes((notes) =>
        notes.filter((note) => !missedNotes.some((m) => m.id === note.id)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroll, notes]);
};
