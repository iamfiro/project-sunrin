import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { BackgroundVideo } from "@/shared/components";
import { useResultStore } from "@/store/useResultStore";

import s from "@/shared/styles/pages/game/result.module.scss";

export default function GameResult() {
  const navigate = useNavigate();

  const accuracy = useResultStore((state) => state.accuracy);
  const rank = useResultStore((state) => state.rank);
  const score = useResultStore((state) => state.score);
  const combo = useResultStore((state) => state.combo);
  const perfect = useResultStore((state) => state.perfect);
  const great = useResultStore((state) => state.great);
  const good = useResultStore((state) => state.good);
  const miss = useResultStore((state) => state.miss);
  const hasValidResult = useResultStore((state) => state.hasValidResult);
  const resetResult = useResultStore((state) => state.resetResult);

  // 최대 콤보 계산
  const maxCombo = useMemo(() => {
    if (combo.length === 0) return 0;
    return Math.max(...combo.map((c) => parseInt(c.split("-")[2]) || 0));
  }, [combo]);

  // 총 노트 수
  const totalNotes = perfect + great + good + miss;

  useEffect(() => {
    if (!hasValidResult()) {
      navigate("/game", { replace: true });
    }
  }, [hasValidResult, navigate]);

  const handleRetry = () => {
    resetResult();
    navigate("/game/main");
  };

  const handleExit = () => {
    resetResult();
    navigate("/game/select");
  };

  // 랭크 클래스 (소문자)
  const rankClass = rank?.toLowerCase() || "f";

  return (
    <>
      <div className={s.container}>
        <div className={s.overlay} />

        {/* 상단 - 랭크 */}
        <section className={s.rankSection}>
          <span className={s.rankLabel}>Rank</span>
          <span className={`${s.rank} ${s[rankClass]}`}>{rank}</span>
          <span className={s.scoreValue}>{score.toLocaleString()}</span>
        </section>

        {/* 중앙 - 스탯 */}
        <section className={s.statsSection}>
          {/* 정확도 바 */}
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

          {/* 판정 그리드 */}
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

          {/* 콤보 정보 */}
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

        {/* 하단 - 버튼 */}
        <section className={s.buttonSection}>
          <button className={`${s.button} ${s.secondary}`} onClick={handleExit}>
            나가기
          </button>
          <button className={`${s.button} ${s.primary}`} onClick={handleRetry}>
            다시하기
          </button>
        </section>
      </div>

      {/* 배경 영상 */}
      <BackgroundVideo
        src="/music/hebi - onward/background.mp4"
        isPaused={false}
        loop={true}
      />
    </>
  );
}
