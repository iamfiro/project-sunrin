import { useEffect, useRef, useState } from "react";

import { GameInfo, GameStats, JudgementLine } from "@/components/game";
import PlayField from "@/components/game/play-field";
import { getChart } from "@/shared/api/chartService";
import { BackgroundVideo } from "@/shared/components";
import { Chart } from "@/shared/types/chart";
import { Note } from "@/shared/types/game/note";
import { useHoldNoteStore } from "@/store/useHoldNoteStore";
import { useResultStore } from "@/store/useResultStore";

import s from "@/shared/styles/pages/game/main.module.scss";

const API_BASE = "http://localhost:8000";

export default function GameMain() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [chart, setChart] = useState<Chart | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const videoEndHandlerRef = useRef<(() => void) | null>(null);
  const setResult = useResultStore((state) => state.setResult);
  const resetResult = useResultStore((state) => state.resetResult);
  const clearHolds = useHoldNoteStore((state) => state.clearAll);

  useEffect(() => {
    const musicId = new URLSearchParams(window.location.search).get("musicId");
    if (musicId) {
      setIsLoading(true);
      resetResult();
      clearHolds();
      setResult({ musicId });
      getChart(musicId)
        .then((chartData) => {
          setChart(chartData);
          setResult({ difficulty: chartData.difficulty });
          const convertedNotes: Note[] = chartData.notes.map((note) => ({
            id: String(note.id),
            time: note.time,
            lane: Math.max(0, note.lane - 1), // 서버의 1-based lane을 0-based로 변환
            type: note.type,
            duration: note.duration ?? undefined,
          }));
          setNotes(convertedNotes);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [setResult, resetResult, clearHolds]);

  const handleVideoEndCallback = (handler: () => void) => {
    videoEndHandlerRef.current = handler;
  };

  const handleVideoEnded = () => {
    if (videoEndHandlerRef.current) {
      videoEndHandlerRef.current();
    }
  };

  if (isLoading || !chart) {
    return (
      <div className={s.container}>
        <div className={s.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className={s.container}>
        <GameInfo
          name={chart.title}
          artist={chart.artist}
          coverUrl={`${API_BASE}${chart.coverUrl}`}
          bpm={chart.bpm}
          userBestScore={chart.userBestRecord?.score ?? null}
        />
        <GameStats />
        <div className={s.playFieldWrap}>
          <div className={s.playFieldContainer}>
            <PlayField
              notes={notes}
              onGameStarted={setIsGameStarted}
              onVideoEndCallback={handleVideoEndCallback}
            />

            <div className={s.playFieldInfo}>
              <div className={s.judgementLine}>
                <JudgementLine />
              </div>
            </div>
          </div>
        </div>
      </div>
      <BackgroundVideo
        src={`${API_BASE}${chart.backgroundVideo}`}
        isPaused={!isGameStarted}
        loop={false}
        onEnded={handleVideoEnded}
      />
    </>
  );
}
