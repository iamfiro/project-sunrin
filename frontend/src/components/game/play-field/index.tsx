import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Note } from "@/shared/types/game/note";
import { useInputStore } from "@/store/inputStore";
import { useResultStore } from "@/store/useResultStore";

import Judgement from "../judgement";
import NoteField from "../note-field";

import s from "./style.module.scss";

// 정확도 계산 함수
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

// 랭크 계산 함수
const calculateRank = (accuracy: number): string => {
  if (accuracy >= 95) return "S";
  if (accuracy >= 90) return "A";
  if (accuracy >= 80) return "B";
  if (accuracy >= 70) return "C";
  if (accuracy >= 60) return "D";
  return "F";
};

const basicChartNotes: Note[] = [
  { id: "n1", time: 1000, lane: 0, type: "tap" },
  { id: "n2", time: 1500, lane: 1, type: "tap" },
  { id: "n3", time: 2000, lane: 2, type: "hold", duration: 800 },
  { id: "n4", time: 2500, lane: 3, type: "tap" },
  { id: "n5", time: 3000, lane: 0, type: "hold", duration: 10000 },
  { id: "n6", time: 3500, lane: 1, type: "tap" },
  { id: "n7", time: 4000, lane: 0, type: "tap" },
  { id: "n8", time: 4500, lane: 1, type: "tap" },
  { id: "n9", time: 5000, lane: 2, type: "hold", duration: 800 },
  { id: "n10", time: 5500, lane: 3, type: "tap" },
  { id: "n11", time: 6000, lane: 0, type: "hold", duration: 10000 },
  { id: "n12", time: 6500, lane: 1, type: "tap" },
];

const JUDGEMENT_WINDOWS = {
  perfect: 30,
  great: 60,
  good: 100,
  miss: 150,
};

const NOTE_DISPLAY_TIME = 2000; // ms

// 콤보 업데이트 함수
const updateCombo = (
  currentCombo: string[],
  currentTime: number,
  isComboBreak: boolean = false,
) => {
  if (currentCombo.length === 0) {
    return [`${currentTime}-${currentTime}-1`];
  }

  const lastCombo = currentCombo[currentCombo.length - 1];
  const [startTime, endTime, count] = lastCombo.split("-").map(Number);

  if (isComboBreak) {
    return [...currentCombo, `${currentTime}-${currentTime}-1`];
  } else {
    const updatedCombo = [...currentCombo];
    updatedCombo[updatedCombo.length - 1] =
      `${startTime}-${currentTime}-${count + 1}`;
    return updatedCombo;
  }
};

export default function PlayField() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>(basicChartNotes);
  const [scroll, setScroll] = useState(0);
  const startTimeRef = useRef<number>(0);
  const hasGameEnded = useRef(false); // ⭐ navigate 여러 번 실행 방지

  const [judgement, setJudgement] = useState<string | null>(null);
  const judgementTimeoutRef = useRef<number | null>(null);

  const { setResult, getResult } = useResultStore();
  const { keys, pressedKeys, pressKey, releaseKey } = useInputStore();

  const showJudgement = (judgement: string) => {
    setJudgement(judgement);
    if (judgementTimeoutRef.current) {
      clearTimeout(judgementTimeoutRef.current);
    }
    judgementTimeoutRef.current = window.setTimeout(() => {
      setJudgement(null);
    }, 1000);
  };

  const handleKeyPress = useCallback(
    (keyIndex: number) => {
      const currentTime = performance.now() - startTimeRef.current;
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
        const current = getResult();
        let score = current.score;
        let perfect = current.perfect;
        let great = current.great;
        let good = current.good;
        let miss = current.miss;
        let combo = [...current.combo];
        let earlyCount = current.earlyCount;
        let lateCount = current.lateCount;

        // Early / Late 측정
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
          // Miss 판정
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

          return;
        }

        // 정확도 및 랭크 계산
        const accuracy = calculateAccuracy(perfect, great, good, 0, miss);
        const rank = calculateRank(accuracy);

        // 정상 판정 반영
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

        // 노트 제거
        setNotes((notes) => notes.filter((n) => n.id !== closestNote!.id));
      }
    },
    [notes, getResult, setResult],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyIndex = keys.indexOf(e.key.toLowerCase());
      if (keyIndex !== -1) {
        pressKey(keyIndex);
        handleKeyPress(keyIndex);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyIndex = keys.indexOf(e.key.toLowerCase());
      if (keyIndex !== -1) {
        releaseKey(keyIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keys, pressKey, releaseKey, handleKeyPress]);

  useEffect(() => {
    startTimeRef.current = performance.now();
    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      const currentTime = timestamp - startTimeRef.current;
      setScroll(currentTime);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ⭐ Miss 처리
  useEffect(() => {
    const missedNotes = notes.filter(
      (note) => scroll > note.time + JUDGEMENT_WINDOWS.miss,
    );

    if (missedNotes.length > 0) {
      showJudgement("Miss");

      const current = getResult();
      const newMissCount = current.miss + missedNotes.length;

      // 정확도 및 랭크 재계산
      const accuracy = calculateAccuracy(
        current.perfect,
        current.great,
        current.good,
        0,
        newMissCount,
      );
      const rank = calculateRank(accuracy);

      setResult({
        miss: newMissCount,
        combo: updateCombo(
          current.combo,
          performance.now() - startTimeRef.current,
          true,
        ),
        accuracy,
        rank,
        isFullCombo: false,
        isAllPerfect: false,
      });

      // Miss 난 노트 제거
      setNotes((notes) =>
        notes.filter((note) => !missedNotes.some((m) => m.id === note.id)),
      );
    }
  }, [scroll, notes, getResult, setResult]);

  // ⭐ 모든 노트가 처리되면 결과 페이지 이동 (navigate 1회 보장)
  useEffect(() => {
    if (!hasGameEnded.current && notes.length === 0) {
      hasGameEnded.current = true;

      const timer = setTimeout(() => {
        navigate("/game/result");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [notes, navigate]);

  return (
    <div className={s.container}>
      <Judgement judgement={judgement} />
      <NoteField
        notes={notes}
        scroll={scroll}
        noteDisplayTime={NOTE_DISPLAY_TIME}
        pressedKeys={pressedKeys}
      />
    </div>
  );
}
