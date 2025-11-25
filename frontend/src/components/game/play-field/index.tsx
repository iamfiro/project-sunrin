import { useCallback, useEffect, useRef, useState } from "react";

import { Note } from "@/shared/types/game/note";
import { useInputStore } from "@/store/inputStore";

import Judgement from "../judgement";
import NoteField from "../note-field";

import s from "./style.module.scss";

const basicChartNotes: Note[] = [
  // --- 1박 ---
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

export default function PlayField() {
  const [notes, setNotes] = useState<Note[]>(basicChartNotes);
  const [scroll, setScroll] = useState(0);
  const startTimeRef = useRef<number>(0);
  const [judgement, setJudgement] = useState<string | null>(null);
  const judgementTimeoutRef = useRef<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

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
        if (timeDiff <= JUDGEMENT_WINDOWS.perfect) {
          showJudgement("Perfect");
          setScore((s) => s + 100);
          setCombo((c) => c + 1);
        } else if (timeDiff <= JUDGEMENT_WINDOWS.great) {
          showJudgement("Great");
          setScore((s) => s + 50);
          setCombo((c) => c + 1);
        } else if (timeDiff <= JUDGEMENT_WINDOWS.good) {
          showJudgement("Good");
          setScore((s) => s + 20);
          setCombo((c) => c + 1);
        } else {
          // Don't judge as miss here, let the miss check handle it
        }
        // Only remove if the hit was within the 'good' window
        if (timeDiff <= JUDGEMENT_WINDOWS.good) {
          setNotes((notes) =>
            notes.filter((note) => note.id !== closestNote!.id),
          );
        }
      }
    },
    [notes],
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

  useEffect(() => {
    // Miss check
    const missedNotes = notes.filter(
      (note) => scroll > note.time + JUDGEMENT_WINDOWS.miss,
    );
    if (missedNotes.length > 0) {
      showJudgement("Miss");
      setCombo(0);
      setNotes((notes) =>
        notes.filter(
          (note) => !missedNotes.some((missed) => missed.id === note.id),
        ),
      );
    }
  }, [scroll]);

  return (
    <>
      <div className={s.container}>
        <Judgement judgement={judgement} />
        <NoteField
          notes={notes}
          scroll={scroll}
          noteDisplayTime={NOTE_DISPLAY_TIME}
          pressedKeys={pressedKeys}
        />
      </div>
    </>
  );
}
