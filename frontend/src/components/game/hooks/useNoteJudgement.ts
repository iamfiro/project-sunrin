import { useCallback, useEffect } from "react";

import { Note } from "@/shared/types/game/note";
import { useInputStore } from "@/store/inputStore";
import { useHitEffectStore } from "@/store/useHitEffectStore";
import { useHoldNoteStore } from "@/store/useHoldNoteStore";
import {
  TimingType,
  useJudgementLineStore,
} from "@/store/useJudgementLineStore";
import { useResultStore } from "@/store/useResultStore";

import { JUDGEMENT_WINDOWS } from "./useMissDetection";

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

export const useNoteJudgement = (
  notes: Note[],
  startTimeRef: React.RefObject<number>,
  showJudgement: (judgement: string) => void,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
) => {
  const { setResult, getResult } = useResultStore();
  const { updateTiming } = useJudgementLineStore();
  const { triggerEffect } = useHitEffectStore();
  const { startHold, endHold, getActiveHold } = useHoldNoteStore();
  const { pressedKeys } = useInputStore();

  const completeHoldNote = useCallback(
    (lane: number, noteId: string) => {
      const currentTime = performance.now() - startTimeRef.current!;
      const current = getResult();

      let score = current.score;
      let perfect = current.perfect;
      let combo = [...current.combo];

      // 롱노트 완료 보너스 점수
      const currentComboCount =
        combo.length > 0 ? parseInt(combo[combo.length - 1].split("-")[2]) : 0;
      const comboBonus = Math.floor(currentComboCount / 20) * 0.05;
      const comboMultiplier = Math.min(1 + comboBonus, 1.5);

      showJudgement("Perfect");
      triggerEffect(lane, "perfect");
      score += Math.floor(750 * comboMultiplier); // 롱노트 완료 점수
      perfect++;
      combo = updateCombo(combo, currentTime, false);

      const miss = current.miss;
      const great = current.great;
      const good = current.good;
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
        earlyCount: current.earlyCount,
        lateCount: current.lateCount,
        accuracy,
        rank,
        isFullCombo: miss === 0,
        isAllPerfect: miss === 0 && great === 0 && good === 0,
      });

      endHold(lane);
      setNotes((notes) => notes.filter((n) => n.id !== noteId));
    },
    [
      startTimeRef,
      getResult,
      setResult,
      showJudgement,
      triggerEffect,
      endHold,
      setNotes,
    ],
  );

  const failHoldNote = useCallback(
    (lane: number, noteId: string) => {
      const currentTime = performance.now() - startTimeRef.current!;
      const current = getResult();

      showJudgement("Miss");
      const combo = updateCombo([...current.combo], currentTime, true);

      setResult({
        miss: current.miss + 1,
        combo,
        earlyCount: current.earlyCount,
        lateCount: current.lateCount,
        isFullCombo: false,
        isAllPerfect: false,
      });

      endHold(lane);
      setNotes((notes) => notes.filter((n) => n.id !== noteId));
    },
    [startTimeRef, getResult, setResult, showJudgement, endHold, setNotes],
  );

  // 롱노트 키 릴리즈 감지
  useEffect(() => {
    const checkHoldNotes = () => {
      const currentTime = performance.now() - (startTimeRef.current || 0);

      // 각 레인의 활성 롱노트 체크
      for (let lane = 0; lane < 4; lane++) {
        const activeHold = getActiveHold(lane);
        if (!activeHold) continue;

        const isKeyPressed = pressedKeys.has(lane);

        // 롱노트 끝 시점에 도달했는지 체크
        if (currentTime >= activeHold.endTime) {
          if (isKeyPressed) {
            // 성공적으로 롱노트 완료
            completeHoldNote(lane, activeHold.noteId);
          } else {
            // 이미 키를 뗀 상태 (MISS는 keyRelease에서 처리됨)
            endHold(lane);
          }
        } else if (!isKeyPressed) {
          // 아직 끝나지 않았는데 키를 뗌 -> MISS
          failHoldNote(lane, activeHold.noteId);
        }
      }
    };

    const interval = setInterval(checkHoldNotes, 16); // ~60fps
    return () => clearInterval(interval);
  }, [
    pressedKeys,
    startTimeRef,
    getActiveHold,
    endHold,
    completeHoldNote,
    failHoldNote,
  ]);

  const handleKeyPress = useCallback(
    (keyIndex: number) => {
      const currentTime = performance.now() - startTimeRef.current!;
      const targetLane = keyIndex;

      let closestNote: Note | null = null;
      let minTimeDiff = Infinity;

      for (const note of notes) {
        if (note.lane === targetLane) {
          const timeDiff = Math.abs(note.time - currentTime);
          // 판정 범위 내의 가장 가까운 노트 찾기
          if (timeDiff < minTimeDiff && timeDiff <= JUDGEMENT_WINDOWS.miss) {
            minTimeDiff = timeDiff;
            closestNote = note;
          }
        }
      }

      const current = getResult();

      // 판정 가능한 노트가 없으면 무시 (빈 타격 MISS 제거)
      if (!closestNote) {
        return;
      }

      if (closestNote) {
        const timeDiff = Math.abs(closestNote.time - currentTime);
        const rawTimeDiff = closestNote.time - currentTime;

        // 롱노트인 경우
        if (closestNote.type === "hold" && closestNote.duration) {
          // 롱노트 시작 판정만 하고, 점수는 끝에서 줌
          if (timeDiff <= JUDGEMENT_WINDOWS.good) {
            // 롱노트 활성화
            startHold(
              targetLane,
              closestNote.id,
              closestNote.time,
              closestNote.duration,
            );

            // 판정선 타이밍 업데이트
            const normalizedTiming = Math.max(
              -1,
              Math.min(1, rawTimeDiff / JUDGEMENT_WINDOWS.miss),
            );
            let timingType: TimingType;
            if (Math.abs(normalizedTiming) < 0.3) {
              timingType = "perfect";
            } else if (normalizedTiming > 0) {
              timingType = "early";
            } else {
              timingType = "late";
            }
            updateTiming(normalizedTiming, timingType);

            // 시작 시 판정 표시 (시간 차이에 따라)
            let startJudgement: "perfect" | "great" | "good";
            if (timeDiff <= JUDGEMENT_WINDOWS.perfect) {
              startJudgement = "perfect";
              showJudgement("Perfect");
            } else if (timeDiff <= JUDGEMENT_WINDOWS.great) {
              startJudgement = "great";
              showJudgement("Great");
            } else {
              startJudgement = "good";
              showJudgement("Good");
            }
            triggerEffect(targetLane, startJudgement);

            // 롱노트 시작 시 notes 배열에서 제거 (중복 처리 방지)
            setNotes((notes) => notes.filter((n) => n.id !== closestNote!.id));
          }
          return; // 롱노트는 여기서 종료 (점수는 끝에서)
        }

        // 일반 노트 판정
        let score = current.score;
        let perfect = current.perfect;
        let great = current.great;
        let good = current.good;
        const miss = current.miss;
        let combo = [...current.combo];
        let earlyCount = current.earlyCount;
        let lateCount = current.lateCount;

        const isEarly = currentTime < closestNote.time;
        if (isEarly) earlyCount++;
        else lateCount++;

        const currentComboCount =
          combo.length > 0
            ? parseInt(combo[combo.length - 1].split("-")[2])
            : 0;
        const comboBonus = Math.floor(currentComboCount / 20) * 0.05;
        const comboMultiplier = Math.min(1 + comboBonus, 1.5);

        const normalizedTiming = Math.max(
          -1,
          Math.min(1, rawTimeDiff / JUDGEMENT_WINDOWS.miss),
        );

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
          updateTiming(normalizedTiming, timingType);
          triggerEffect(targetLane, "perfect");
          const baseScore = 500;
          score += Math.floor(baseScore * comboMultiplier);
          perfect++;
          combo = updateCombo(combo, currentTime, false);
        } else if (timeDiff <= JUDGEMENT_WINDOWS.great) {
          showJudgement("Great");
          updateTiming(normalizedTiming, timingType);
          triggerEffect(targetLane, "great");
          const baseScore = 300;
          score += Math.floor(baseScore * comboMultiplier);
          great++;
          combo = updateCombo(combo, currentTime, false);
        } else if (timeDiff <= JUDGEMENT_WINDOWS.good) {
          showJudgement("Good");
          updateTiming(normalizedTiming, timingType);
          triggerEffect(targetLane, "good");
          const baseScore = 100;
          score += Math.floor(baseScore * comboMultiplier);
          good++;
          combo = updateCombo(combo, currentTime, false);
        } else {
          showJudgement("Miss");
          combo = updateCombo(combo, currentTime, true);

          setResult({
            miss: miss + 1,
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
    [
      notes,
      getResult,
      setResult,
      startTimeRef,
      showJudgement,
      setNotes,
      updateTiming,
      triggerEffect,
      startHold,
    ],
  );

  return { handleKeyPress };
};
