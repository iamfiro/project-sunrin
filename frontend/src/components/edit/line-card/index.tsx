import cn from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";

import { Note } from "@/shared/types/game/note";
import { useNoteStore } from "@/store/useNoteStore";

import s from "./style.module.scss";

interface Props {
  notes: Note[];
  lane: number;
  measureStartTime: number;
  measureDuration: number;
}

export default function LineCard({
  notes,
  lane,
  measureStartTime,
  measureDuration,
}: Props) {
  const {
    selectedNoteId,
    selectNote,
    updateNote,
    addNote,
    shortNoteColor,
    longNoteColor,
  } = useNoteStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // 드래그 상태
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef<number | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // 리사이즈 상태
  const resizingNoteRef = useRef<Note | null>(null);
  const noteElementRef = useRef<HTMLDivElement | null>(null);

  // 섹션 너비 (200px per 500ms)
  const SECTION_WIDTH = 200;

  // 노트 위치 계산 (섹션 기준 상대 좌표)
  const getNoteLeft = useCallback(
    (noteTime: number) => {
      const relativeTime = noteTime - measureStartTime;
      return (relativeTime / measureDuration) * SECTION_WIDTH;
    },
    [measureStartTime, measureDuration],
  );

  // 롱노트 너비 계산 (섹션 기준)
  const getNoteWidth = useCallback(
    (duration: number) => {
      return (duration / measureDuration) * SECTION_WIDTH;
    },
    [measureDuration],
  );

  // 마우스 X 위치를 시간으로 변환 (섹션 기준)
  const getTimeFromX = useCallback(
    (clientX: number): number => {
      if (!containerRef.current) return measureStartTime;

      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;

      // 섹션 내 상대 위치를 시간으로 변환
      const percentage = Math.max(0, Math.min(relativeX / SECTION_WIDTH, 1));
      return measureStartTime + percentage * measureDuration;
    },
    [measureStartTime, measureDuration],
  );

  // 마우스 이동
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingRef.current) return;
      const time = getTimeFromX(e.clientX);
      setHoverTime(time);
    },
    [getTimeFromX],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isDraggingRef.current) {
      setHoverTime(null);
    }
  }, []);

  // 마우스 다운
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const time = getTimeFromX(e.clientX);
      isDraggingRef.current = true;
      dragStartTimeRef.current = time;
      setDragPreview({ start: time, end: time });
    },
    [getTimeFromX],
  );

  // 전역 마우스 이벤트
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const time = getTimeFromX(e.clientX);
      setDragPreview((prev) =>
        prev ? { start: prev.start, end: time } : null,
      );
    };

    const handleGlobalMouseUp = () => {
      if (!isDraggingRef.current || !dragStartTimeRef.current) return;

      const startTime = dragStartTimeRef.current;
      const endTime = dragPreview?.end ?? startTime;
      const minTime = Math.min(startTime, endTime);
      const maxTime = Math.max(startTime, endTime);
      const duration = maxTime - minTime;

      // 클릭한 위치에 정확히 노트 찍기 (섹션 제한 없음)
      if (duration < 30) {
        addNote({
          time: Math.round(minTime),
          lane: lane,
          type: "tap",
        });
      } else {
        addNote({
          time: Math.round(minTime),
          lane: lane,
          type: "hold",
          duration: Math.round(duration),
        });
      }

      isDraggingRef.current = false;
      dragStartTimeRef.current = null;
      setDragPreview(null);
      setHoverTime(null);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [
    lane,
    addNote,
    measureStartTime,
    measureDuration,
    dragPreview,
    getTimeFromX,
  ]);

  // 리사이즈 핸들러
  const handleResizeStart = (e: React.PointerEvent, note: Note) => {
    e.stopPropagation();
    e.preventDefault();
    resizingNoteRef.current = note;
    noteElementRef.current = (e.target as HTMLElement)
      .parentElement as HTMLDivElement;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (
      !resizingNoteRef.current ||
      !containerRef.current ||
      !noteElementRef.current
    )
      return;

    const containerRect = containerRef.current.getBoundingClientRect();

    // 노트의 섹션 내 시작 위치 (픽셀)
    const noteLeft = parseFloat(noteElementRef.current.style.left) || 0;

    // 마우스의 섹션 내 위치
    const mouseX = e.clientX - containerRect.left;

    // 새로운 너비 = 마우스 위치 - 노트 시작 위치
    let newWidth = mouseX - noteLeft;
    if (newWidth < 20) newWidth = 20;

    noteElementRef.current.style.width = `${newWidth}px`;
  };

  const handlePointerUp = () => {
    if (!resizingNoteRef.current || !noteElementRef.current) return;

    const note = resizingNoteRef.current;
    const finalWidth = parseFloat(noteElementRef.current.style.width);

    // 섹션 기준 너비를 duration으로 변환
    const newDuration = (finalWidth / SECTION_WIDTH) * measureDuration;

    updateNote(note.id, { duration: Math.round(Math.max(newDuration, 50)) });

    resizingNoteRef.current = null;
    noteElementRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  // 프리뷰 계산
  const previewLeft = hoverTime !== null ? getNoteLeft(hoverTime) : null;
  const dragLeft =
    dragPreview !== null
      ? getNoteLeft(Math.min(dragPreview.start, dragPreview.end))
      : null;
  const dragWidth =
    dragPreview !== null
      ? getNoteWidth(Math.abs(dragPreview.end - dragPreview.start))
      : null;

  return (
    <div
      ref={containerRef}
      className={s.container}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
    >
      {/* 호버 프리뷰 */}
      {previewLeft !== null && dragPreview === null && (
        <div
          className={s.previewNote}
          style={{
            left: `${previewLeft}px`,
            backgroundColor: shortNoteColor,
          }}
        />
      )}

      {/* 드래그 프리뷰 */}
      {dragLeft !== null && dragWidth !== null && (
        <div
          className={cn(s.previewNote, {
            [s.previewLongNote]: dragWidth > 45,
          })}
          style={{
            left: `${dragLeft}px`,
            width: dragWidth > 45 ? `${dragWidth}px` : "45px",
            backgroundColor: dragWidth > 45 ? longNoteColor : shortNoteColor,
          }}
        />
      )}

      {/* 실제 노트 */}
      {notes.map((note) => {
        const left = getNoteLeft(note.time);
        const isSelected = note.id === selectedNoteId;

        const handleNoteClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          selectNote(isSelected ? null : note.id);
        };

        if (note.type === "hold") {
          const width = getNoteWidth(note.duration || 0);

          return (
            <div
              key={note.id}
              className={cn(s.note, s.hold, { [s.selected]: isSelected })}
              style={{
                left: `${left}px`,
                width: `${width}px`,
                minWidth: "45px",
              }}
              onClick={handleNoteClick}
            >
              <div
                className={s.tail}
                style={{ backgroundColor: longNoteColor }}
              />
              <div
                className={s.tailEnd}
                onPointerDown={(e) => handleResizeStart(e, note)}
                style={{ backgroundColor: longNoteColor }}
              />
            </div>
          );
        }

        return (
          <div
            key={note.id}
            className={cn(s.note, { [s.selected]: isSelected })}
            style={{
              left: `${left}px`,
              backgroundColor: shortNoteColor,
            }}
            onClick={handleNoteClick}
          />
        );
      })}
    </div>
  );
}
