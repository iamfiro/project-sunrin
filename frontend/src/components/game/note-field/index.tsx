import { memo, useEffect, useMemo, useRef, useState } from "react";

import { Note } from "@/shared/types/game/note";

import NoteLine from "../note-line";

import s from "./style.module.scss";

interface NoteFieldProps {
  notes: Note[];
  scroll: number;
  noteDisplayTime: number;
  pressedKeys: Set<number>;
  allNotes?: Note[]; // 원본 노트 배열 (활성 롱노트 정보용)
  processedNoteIds?: Set<string>; // 처리된 노트 ID 목록
}

const LANES = [0, 1, 2, 3] as const;

const NoteField = memo(
  ({
    notes,
    scroll,
    noteDisplayTime,
    pressedKeys,
    allNotes = [],
    processedNoteIds = new Set(),
  }: NoteFieldProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(600); // 기본값

    // 컨테이너 높이 측정
    useEffect(() => {
      const updateHeight = () => {
        if (containerRef.current) {
          setContainerHeight(containerRef.current.clientHeight);
        }
      };

      updateHeight();
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }, []);

    // 레인별 노트 분리 (메모이제이션) - 처리되지 않은 노트만
    const notesByLane = useMemo(() => {
      const result: Note[][] = [[], [], [], []];
      for (const note of notes) {
        if (note.lane >= 0 && note.lane < 4 && !processedNoteIds.has(note.id)) {
          result[note.lane].push(note);
        }
      }
      return result;
    }, [notes, processedNoteIds]);

    // 레인별 원본 노트 분리 (활성 롱노트용)
    const allNotesByLane = useMemo(() => {
      const result: Note[][] = [[], [], [], []];
      for (const note of allNotes) {
        if (note.lane >= 0 && note.lane < 4) {
          result[note.lane].push(note);
        }
      }
      return result;
    }, [allNotes]);

    // 키 눌림 상태 배열
    const pressedArray = useMemo(
      () => [
        pressedKeys.has(0),
        pressedKeys.has(1),
        pressedKeys.has(2),
        pressedKeys.has(3),
      ],
      [pressedKeys],
    );

    return (
      <div className={s.contents} ref={containerRef}>
        {LANES.map((lane) => (
          <NoteLine
            key={lane}
            lane={lane}
            notes={notesByLane[lane]}
            scroll={scroll}
            noteDisplayTime={noteDisplayTime}
            isKeyPressed={pressedArray[lane]}
            allNotes={allNotesByLane[lane]}
            containerHeight={containerHeight}
          />
        ))}
      </div>
    );
  },
);

NoteField.displayName = "NoteField";

export default NoteField;
