import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getChart } from "@/shared/api/chartService";
import { saveResult } from "@/shared/api/resultService";
import { BackgroundVideo } from "@/shared/components";
import { Chart } from "@/shared/types/chart";
import { useResultStore } from "@/store/useResultStore";

import s from "@/shared/styles/pages/game/result.module.scss";

const API_BASE = "http://localhost:8000";

export default function GameResult() {
  const navigate = useNavigate();
  const [chart, setChart] = useState<Chart | null>(null);
  const resultSavedRef = useRef(false);

  const musicId = useResultStore((state) => state.musicId);
  const accuracy = useResultStore((state) => state.accuracy);
  const rank = useResultStore((state) => state.rank);
  const score = useResultStore((state) => state.score);
  const combo = useResultStore((state) => state.combo);
  const perfect = useResultStore((state) => state.perfect);
  const great = useResultStore((state) => state.great);
  const good = useResultStore((state) => state.good);
  const miss = useResultStore((state) => state.miss);
  const bad = useResultStore((state) => state.bad);
  const earlyCount = useResultStore((state) => state.earlyCount);
  const lateCount = useResultStore((state) => state.lateCount);
  const isFullCombo = useResultStore((state) => state.isFullCombo);
  const isAllPerfect = useResultStore((state) => state.isAllPerfect);
  const hasValidResult = useResultStore((state) => state.hasValidResult);
  const resetResult = useResultStore((state) => state.resetResult);

  const maxCombo = useMemo(() => {
    if (combo.length === 0) return 0;
    return Math.max(...combo.map((c) => parseInt(c.split("-")[2]) || 0));
  }, [combo]);

  const totalNotes = perfect + great + good + miss;

  useEffect(() => {
    if (!hasValidResult()) {
      navigate("/game/select", { replace: true });
      return;
    }

    if (musicId) {
      getChart(musicId).then(setChart);
    }
  }, [hasValidResult, navigate, musicId]);

  useEffect(() => {
    if (!hasValidResult() || resultSavedRef.current || !musicId) return;

    resultSavedRef.current = true;
    saveResult({
      musicId,
      score,
      accuracy,
      combo: combo.join(","),
      rank,
      isFullCombo,
      isAllPerfect,
      perfect,
      great,
      good,
      miss,
      bad: bad ?? 0,
      earlyCount,
      lateCount,
    }).catch(console.error);
  }, [
    hasValidResult,
    musicId,
    score,
    accuracy,
    combo,
    rank,
    isFullCombo,
    isAllPerfect,
    perfect,
    great,
    good,
    miss,
    bad,
    earlyCount,
    lateCount,
  ]);

  const handleRetry = () => {
    resetResult();
    navigate(`/game/main?musicId=${musicId}`);
  };

  const handleExit = () => {
    resetResult();
    navigate("/game/select");
  };

  const rankClass = rank?.toLowerCase() || "f";

  return (
    <>
      <div className={s.container}>
        <div className={s.overlay} />

        <section className={s.rankSection}>
          <span className={s.rankLabel}>Rank</span>
          <span className={`${s.rank} ${s[rankClass]}`}>{rank}</span>
          <span className={s.scoreValue}>{score.toLocaleString()}</span>
        </section>

        <section className={s.statsSection}>
          <div className={s.accuracyBar}>
            <div className={s.accuracyHeader}>
              <span className={s.accuracyLabel}>Accuracy</span>
              <span className={s.accuracyValue}>{accuracy}%</span>
            </div>
            <div className={s.progressBar}>
              <div
                className={s.progressFill}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>

          <div className={s.statsGrid}>
            <div className={s.statItem}>
              <span className={s.statLabel}>Perfect</span>
              <span className={`${s.statValue} ${s.perfect}`}>{perfect}</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statLabel}>Great</span>
              <span className={`${s.statValue} ${s.great}`}>{great}</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statLabel}>Good</span>
              <span className={`${s.statValue} ${s.good}`}>{good}</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statLabel}>Miss</span>
              <span className={`${s.statValue} ${s.miss}`}>{miss}</span>
            </div>
          </div>

          <div className={s.comboInfo}>
            <div className={s.comboItem}>
              <span className={s.comboLabel}>Max Combo</span>
              <span className={s.comboValue}>{maxCombo}</span>
            </div>
            <div className={s.comboItem}>
              <span className={s.comboLabel}>Total Notes</span>
              <span className={s.comboValue}>{totalNotes}</span>
            </div>
          </div>
        </section>

        <section className={s.buttonSection}>
          <button className={`${s.button} ${s.secondary}`} onClick={handleExit}>
            나가기
          </button>
          <button className={`${s.button} ${s.primary}`} onClick={handleRetry}>
            다시하기
          </button>
        </section>
      </div>

      <BackgroundVideo
        src={chart ? `${API_BASE}${chart.backgroundVideo}` : ""}
        isPaused={false}
        loop={true}
      />
    </>
  );
}
