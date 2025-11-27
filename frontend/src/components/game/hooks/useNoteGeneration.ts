import { useEffect, useMemo, useRef, useState } from "react";

import { Note } from "@/shared/types/game/note";

const NOTE_LANE_COUNT = 4;
const NOTE_BATCH_SIZE = 8;
const NOTE_RENEW_THRESHOLD = 6;
const NOTE_INITIAL_DELAY = 1;
const NOTE_MIN_INTERVAL = 120;
const NOTE_MAX_INTERVAL = 320;
const NOTE_DENSITY_MULTIPLIER = 1.7;
const NOTE_BURST_CHANCE = 0.6;
const NOTE_BURST_COUNT = 2;
const HOLD_CHANCE = 0.25;
const HOLD_MIN_DURATION = 1000;
const HOLD_MAX_DURATION = 2000;
const NOTE_DISPLAY_TIME = 600;

let randomNoteIdSeed = 0;

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomLaneExcluding = (exclude: number[]): number => {
  const lanes = Array.from({ length: NOTE_LANE_COUNT }, (_, idx) => idx).filter(
    (lane) => !exclude.includes(lane),
  );
  if (lanes.length === 0) {
    return Math.floor(Math.random() * NOTE_LANE_COUNT);
  }
  return lanes[Math.floor(Math.random() * lanes.length)];
};

const createRandomNotesBatch = (startTime: number, count: number): Note[] => {
  const notes: Note[] = [];
  let time = startTime;

  const targetCount = Math.max(1, Math.round(count * NOTE_DENSITY_MULTIPLIER));

  for (let i = 0; i < targetCount; i += 1) {
    const isHold = Math.random() < HOLD_CHANCE;
    const note: Note = {
      id: `random-note-${Date.now().toString(36)}-${randomNoteIdSeed++}`,
      time,
      lane: Math.floor(Math.random() * NOTE_LANE_COUNT),
      type: isHold ? "hold" : "tap",
      ...(isHold
        ? { duration: randomBetween(HOLD_MIN_DURATION, HOLD_MAX_DURATION) }
        : {}),
    };

    notes.push(note);
    if (Math.random() < NOTE_BURST_CHANCE) {
      const burstExcluded = [note.lane];
      for (let burstIndex = 0; burstIndex < NOTE_BURST_COUNT; burstIndex += 1) {
        const burstIsHold = Math.random() < HOLD_CHANCE;
        const burstNote: Note = {
          id: `random-note-${Date.now().toString(36)}-${randomNoteIdSeed++}`,
          time,
          lane: getRandomLaneExcluding(burstExcluded),
          type: burstIsHold ? "hold" : "tap",
          ...(burstIsHold
            ? { duration: randomBetween(HOLD_MIN_DURATION, HOLD_MAX_DURATION) }
            : {}),
        };
        notes.push(burstNote);
        burstExcluded.push(burstNote.lane);
      }
    }
    time += randomBetween(NOTE_MIN_INTERVAL, NOTE_MAX_INTERVAL);
  }

  return notes;
};

/**
 * 노트 생성 및 관리
 */
export const useNoteGeneration = (scroll: number) => {
  const initialNotes = useMemo<Note[]>(
    () => createRandomNotesBatch(NOTE_INITIAL_DELAY, NOTE_BATCH_SIZE),
    [],
  );
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const lastNoteTimeRef = useRef(
    initialNotes[initialNotes.length - 1]?.time ?? NOTE_INITIAL_DELAY,
  );

  useEffect(() => {
    if (notes.length <= NOTE_RENEW_THRESHOLD) {
      const nextStartTime = Math.max(
        lastNoteTimeRef.current + NOTE_MIN_INTERVAL,
        scroll + NOTE_DISPLAY_TIME,
      );
      const newNotes = createRandomNotesBatch(nextStartTime, NOTE_BATCH_SIZE);
      lastNoteTimeRef.current =
        newNotes[newNotes.length - 1]?.time ?? nextStartTime;
      setNotes((prev) => [...prev, ...newNotes]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length, scroll]);

  return { notes, setNotes, noteDisplayTime: NOTE_DISPLAY_TIME };
};
