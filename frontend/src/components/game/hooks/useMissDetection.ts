import { useEffect } from "react";

import { Note } from "@/shared/types/game/note";
import { useResultStore } from "@/store/useResultStore";

export const JUDGEMENT_WINDOWS = {
  perfect: 30,
  great: 60,
  good: 100,
  miss: 150, // 판정 범위 (키를 눌렀을 때)
};

// 노트가 자동으로 Miss 처리되는 시간 (판정선 통과 후)
export const AUTO_MISS_TIME = 200; // 3000 → 200ms

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

export const useMissDetection = (
  scroll: number,
  notes: Note[],
  startTimeRef: React.RefObject<number>,
  showJudgement: (judgement: string) => void,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
) => {
  const { setResult, getResult } = useResultStore();

  useEffect(() => {
    const missedNotes = notes.filter((note) => {
      // 롱노트는 끝 시간 기준, 일반 노트는 시작 시간 기준
      const noteEndTime =
        note.type === "hold" && note.duration
          ? note.time + note.duration
          : note.time;
      return scroll > noteEndTime + AUTO_MISS_TIME;
    });

    if (missedNotes.length > 0) {
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

      const combo = updateCombo(
        current.combo,
        performance.now() - startTimeRef.current!,
        true,
      );

      // Miss 판정 표시
      showJudgement("Miss");

      setResult({
        miss: newMissCount,
        combo,
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
  }, [scroll]);
};
