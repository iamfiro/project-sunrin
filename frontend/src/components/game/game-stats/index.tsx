import { useResultStore } from "@/store/useResultStore";

import s from "./style.module.scss";

export default function GameStats() {
  const { perfectHigh, perfect, great, good, miss, accuracy, score } =
    useResultStore();

  // 총 노트 수 계산
  const totalNotes = perfectHigh + perfect + great + good + miss;

  // Mastery 점수 계산 (가중치 적용)
  const mastery =
    totalNotes > 0
      ? ((perfectHigh * 1.0 +
          perfect * 0.95 +
          great * 0.8 +
          good * 0.5 +
          miss * 0) /
          totalNotes) *
        100
      : 0;

  // 숫자 포맷팅
  const formatCount = (num: number) => num.toString().padStart(4, "0");

  // 퍼센트 계산
  const getPercentage = (count: number) => {
    return totalNotes > 0 ? ((count / totalNotes) * 100).toFixed(1) : "0.0";
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.headerTitle}>JUDGEMENT</div>
        <div className={s.headerAccuracy}>{accuracy.toFixed(1)}%</div>
      </div>

      <div className={s.statsGrid}>
        <div className={`${s.statCard} ${s.perfectHigh}`}>
          <div className={s.cardHeader}>
            <span className={s.cardLabel}>PERFECT+</span>
            <span className={s.cardPercentage}>{getPercentage(perfectHigh)}%</span>
          </div>
          <div className={s.cardCount}>{formatCount(perfectHigh)}</div>
          <div className={s.cardBar}>
            <div
              className={s.cardBarFill}
              style={{ width: `${getPercentage(perfectHigh)}%` }}
            />
          </div>
        </div>

        <div className={`${s.statCard} ${s.perfect}`}>
          <div className={s.cardHeader}>
            <span className={s.cardLabel}>PERFECT</span>
            <span className={s.cardPercentage}>{getPercentage(perfect)}%</span>
          </div>
          <div className={s.cardCount}>{formatCount(perfect)}</div>
          <div className={s.cardBar}>
            <div
              className={s.cardBarFill}
              style={{ width: `${getPercentage(perfect)}%` }}
            />
          </div>
        </div>

        <div className={`${s.statCard} ${s.great}`}>
          <div className={s.cardHeader}>
            <span className={s.cardLabel}>GREAT</span>
            <span className={s.cardPercentage}>{getPercentage(great)}%</span>
          </div>
          <div className={s.cardCount}>{formatCount(great)}</div>
          <div className={s.cardBar}>
            <div
              className={s.cardBarFill}
              style={{ width: `${getPercentage(great)}%` }}
            />
          </div>
        </div>

        <div className={`${s.statCard} ${s.good}`}>
          <div className={s.cardHeader}>
            <span className={s.cardLabel}>GOOD</span>
            <span className={s.cardPercentage}>{getPercentage(good)}%</span>
          </div>
          <div className={s.cardCount}>{formatCount(good)}</div>
          <div className={s.cardBar}>
            <div
              className={s.cardBarFill}
              style={{ width: `${getPercentage(good)}%` }}
            />
          </div>
        </div>

        <div className={`${s.statCard} ${s.miss}`}>
          <div className={s.cardHeader}>
            <span className={s.cardLabel}>MISS</span>
            <span className={s.cardPercentage}>{getPercentage(miss)}%</span>
          </div>
          <div className={s.cardCount}>{formatCount(miss)}</div>
          <div className={s.cardBar}>
            <div
              className={s.cardBarFill}
              style={{ width: `${getPercentage(miss)}%` }}
            />
          </div>
        </div>
      </div>

      <div className={s.footer}>
        <div className={s.scoreBox}>
          <div className={s.scoreLabel}>SCORE</div>
          <div className={s.scoreValue}>{score.toLocaleString()}</div>
        </div>
        <div className={s.masteryBox}>
          <div className={s.masteryLabel}>MASTERY</div>
          <div className={s.masteryValue}>{mastery.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
