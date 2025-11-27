import { useCallback } from "react";

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
  const isAllPerfect = perfect === totalNotes && totalNotes > 0;
  if (isAllPerfect) return "SS";

  if (accuracy >= 98) return "SS";
  if (accuracy >= 95) return "S";
  if (accuracy >= 90) return "A";
  if (accuracy >= 85) return "A";
  if (accuracy >= 80) return "B";
  if (accuracy >= 75) return "B";
  if (accuracy >= 70) return "C";
  if (accuracy >= 60) return "C";
  if (accuracy >= 50) return "D";
  return "F";
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
  } else {
    const updatedCombo = [...currentCombo];
    updatedCombo[updatedCombo.length - 1] =
      `${startTime}-${currentTime}-${count + 1}`;
    return updatedCombo;
  }
};

/**
 * 노트 판정 처리
 */
export const useNoteJudgement = (
  notes: Note[],
  startTimeRef: React.RefObject<number>,
  showJudgement: (judgement: string) => void,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
) => {
  const { setResult, getResult } = useResultStore();

  const handleKeyPress = useCallback(
    (keyIndex: number) => {
      const currentTime = performance.now() - startTimeRef.current!;
      const targetLane = keyIndex;

      let closestNote: Note | null = null;
      let minTimeDiff = Infinity;

      for (const note of notes) {
        if (note.lane === targetLane) {
          const timeDiff = Math.abs(note.time - currentTime);
          if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestNote = note;
          }
        }
      }

      if (closestNote) {
        const timeDiff = Math.abs(closestNote.time - currentTime);

        // 판정 범위 밖이면 무시
        if (timeDiff > JUDGEMENT_WINDOWS.miss) {
          return;
        }

        const current = getResult();
        let score = current.score;
        let perfect = current.perfect;
        let great = current.great;
        let good = current.good;
        let miss = current.miss;
        let combo = [...current.combo];
        let earlyCount = current.earlyCount;
        let lateCount = current.lateCount;

        const isEarly = currentTime < closestNote.time;
        if (isEarly) earlyCount++;
        else lateCount++;

        if (timeDiff <= JUDGEMENT_WINDOWS.perfect) {
          showJudgement("Perfect");
          score += 100;
          perfect++;
          combo = updateCombo(combo, currentTime, false);
        } else if (timeDiff <= JUDGEMENT_WINDOWS.great) {
          showJudgement("Great");
          score += 50;
          great++;
          combo = updateCombo(combo, currentTime, false);
        } else if (timeDiff <= JUDGEMENT_WINDOWS.good) {
          showJudgement("Good");
          score += 20;
          good++;
          combo = updateCombo(combo, currentTime, false);
        } else {
          showJudgement("Miss");
          miss++;
          combo = updateCombo(combo, currentTime, true);

          setResult({
            miss,
            combo,
            earlyCount,
            lateCount,
            isFullCombo: false,
            isAllPerfect: false,
          });

          setNotes((notes) => notes.filter((n) => n.id !== closestNote!.id));
          return;
        }

        const accuracy = calculateAccuracy(perfect, great, good, 0, miss);
        const totalNotes = perfect + great + good + miss;
        const rank = calculateRank(accuracy, perfect, totalNotes);

        setResult({
          score,
          perfect,
          great,
          good,
          miss,
          combo,
          earlyCount,
          lateCount,
          accuracy,
          rank,
          isFullCombo: miss === 0,
          isAllPerfect: miss === 0 && great === 0 && good === 0,
        });

        setNotes((notes) => notes.filter((n) => n.id !== closestNote!.id));
      }
    },
    [notes, getResult, setResult, startTimeRef, showJudgement, setNotes],
  );

  return { handleKeyPress };
};
