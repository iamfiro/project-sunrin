import { useCallback } from "react";

import { Note } from "@/shared/types/game/note";
import { useResultStore } from "@/store/useResultStore";
import { useJudgementLineStore, TimingType } from "@/store/useJudgementLineStore";

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
  const { addIndicator } = useJudgementLineStore();

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

      const current = getResult();

      // 노트가 없거나 판정 범위 밖일 때 Miss 처리
      if (!closestNote || minTimeDiff > JUDGEMENT_WINDOWS.miss) {
        showJudgement("Miss");
        const miss = current.miss + 1;
        const combo = updateCombo([...current.combo], currentTime, true);
        const accuracy = calculateAccuracy(
          current.perfect,
          current.great,
          current.good,
          0,
          miss,
        );
        const totalNotes =
          current.perfect + current.great + current.good + miss;
        const rank = calculateRank(accuracy, current.perfect, totalNotes);

        setResult({
          ...current,
          miss,
          combo,
          accuracy,
          rank,
          isFullCombo: false,
          isAllPerfect: false,
        });
        return;
      }

      if (closestNote) {
        const timeDiff = Math.abs(closestNote.time - currentTime);
        const rawTimeDiff = closestNote.time - currentTime; // 음수면 late, 양수면 early

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

        // 노트 타입에 따른 점수 배율
        const isLongNote = closestNote.type === "hold";
        const baseScoreMultiplier = isLongNote ? 1.5 : 1; // 롱노트는 1.5배

        // 콤보 보너스 계산 (현재 콤보 수에 따라)
        const currentComboCount =
          combo.length > 0
            ? parseInt(combo[combo.length - 1].split("-")[2])
            : 0;
        const comboBonus = Math.floor(currentComboCount / 20) * 0.05; // 20콤보마다 5% 추가
        const comboMultiplier = Math.min(1 + comboBonus, 1.5); // 최대 1.5배

        // 판정선에 표시할 타이밍 계산 (-1 ~ 1)
        // rawTimeDiff가 양수면 early (왼쪽), 음수면 late (오른쪽)
        const normalizedTiming = Math.max(-1, Math.min(1, 
          rawTimeDiff / JUDGEMENT_WINDOWS.miss
        ));

        let timingType: TimingType;
        if (Math.abs(normalizedTiming) < 0.3) {
          timingType = "perfect";
        } else if (normalizedTiming > 0) {
          timingType = "early";
        } else {
          timingType = "late";
        }

        if (timeDiff <= JUDGEMENT_WINDOWS.perfect) {
          showJudgement("Perfect");
          addIndicator(normalizedTiming, timingType);
          const baseScore = 500;
          score += Math.floor(
            baseScore * baseScoreMultiplier * comboMultiplier,
          );
          perfect++;
          combo = updateCombo(combo, currentTime, false);
        } else if (timeDiff <= JUDGEMENT_WINDOWS.great) {
          showJudgement("Great");
          addIndicator(normalizedTiming, timingType);
          const baseScore = 300;
          score += Math.floor(
            baseScore * baseScoreMultiplier * comboMultiplier,
          );
          great++;
          combo = updateCombo(combo, currentTime, false);
        } else if (timeDiff <= JUDGEMENT_WINDOWS.good) {
          showJudgement("Good");
          addIndicator(normalizedTiming, timingType);
          const baseScore = 100;
          score += Math.floor(
            baseScore * baseScoreMultiplier * comboMultiplier,
          );
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
    [notes, getResult, setResult, startTimeRef, showJudgement, setNotes, addIndicator],
  );

  return { handleKeyPress };
};
