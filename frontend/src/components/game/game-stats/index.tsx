import { useResultStore } from "@/store/useResultStore";

import s from "./style.module.scss";

export default function GameStats() {
  const { perfect, great, good, miss, accuracy, score } = useResultStore();

  // PERFECT·HIGH는 perfect의 일부로 간주 (나중에 earlyCount/lateCount로 세분화 가능)
  const perfectHigh = perfect;
  const perfectNormal = 0; // 나중에 세분화 시 사용

  // Mastery 계산 (간단한 공식 - 실제 게임 로직에 맞게 조정 필요)
  const mastery = (score / 1000).toFixed(2);

  return (
    <div className={s.container}>
      <div className={s.statsGrid}>
        <div className={s.statRow}>
          <span className={`${s.label} ${s.perfectHigh}`}>PERFECT·HIGH</span>
          <span className={s.value}>
            {String(perfectHigh).padStart(5, "0")}
          </span>
        </div>
        <div className={s.statRow}>
          <span className={`${s.label} ${s.perfect}`}>PERFECT</span>
          <span className={s.value}>
            {String(perfectNormal).padStart(5, "0")}
          </span>
        </div>
        <div className={s.statRow}>
          <span className={`${s.label} ${s.great}`}>GREAT</span>
          <span className={s.value}>{String(great).padStart(5, "0")}</span>
        </div>
        <div className={s.statRow}>
          <span className={`${s.label} ${s.good}`}>GOOD</span>
          <span className={s.value}>{String(good).padStart(5, "0")}</span>
        </div>
        <div className={s.statRow}>
          <span className={`${s.label} ${s.miss}`}>MISS</span>
          <span className={s.value}>{String(miss).padStart(5, "0")}</span>
        </div>
      </div>

      <div className={s.divider}></div>

      <div className={s.totalStats}>
        <div className={s.statRow}>
          <span className={s.totalLabel}>TOTAL</span>
          <span className={s.totalValue}>{accuracy.toFixed(2)}%</span>
        </div>
        <div className={s.statRow}>
          <span className={s.masteryLabel}>MASTERY</span>
          <span className={s.masteryValue}>{mastery}</span>
        </div>
      </div>
    </div>
  );
}
