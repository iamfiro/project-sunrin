import { useEffect, useRef, useState } from "react";

import { useResultStore } from "@/store/useResultStore";

import s from "./style.module.scss";

// 숫자 카운트 애니메이션 훅
function useCountAnimation(target: number, duration: number = 300) {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (current === target) return;

    const startValue = current;
    const difference = target - startValue;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuad 이징 함수
      const easeProgress = progress * (2 - progress);
      const newValue = Math.floor(startValue + difference * easeProgress);

      setCurrent(newValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target]);

  return current;
}

export default function GameStats() {
  const { perfect, great, good, miss, score } = useResultStore();
  const [scoreKey, setScoreKey] = useState(0);

  const animatedPerfect = useCountAnimation(perfect, 300);
  const animatedGreat = useCountAnimation(great, 300);
  const animatedGood = useCountAnimation(good, 300);
  const animatedMiss = useCountAnimation(miss, 300);
  const animatedScore = useCountAnimation(score, 800); // 더 긴 애니메이션

  // score가 변경될 때마다 애니메이션 재시작
  useEffect(() => {
    if (score > 0) {
      setScoreKey((prev) => prev + 1);
    }
  }, [score]);

  return (
    <div className={s.container}>
      <div className={s.statsGrid}>
        <div className={s.statRow}>
          <span className={`${s.label} ${s.perfect}`}>PERFECT</span>
          <span className={s.value}>
            {String(animatedPerfect).padStart(5, "0")}
          </span>
        </div>
        <div className={s.statRow}>
          <span className={`${s.label} ${s.great}`}>GREAT</span>
          <span className={s.value}>
            {String(animatedGreat).padStart(5, "0")}
          </span>
        </div>
        <div className={s.statRow}>
          <span className={`${s.label} ${s.good}`}>GOOD</span>
          <span className={s.value}>
            {String(animatedGood).padStart(5, "0")}
          </span>
        </div>
        <div className={s.statRow}>
          <span className={`${s.label} ${s.miss}`}>MISS</span>
          <span className={s.value}>
            {String(animatedMiss).padStart(5, "0")}
          </span>
        </div>
      </div>

      <div className={s.divider}></div>

      <div className={s.totalStats}>
        <div className={s.statRow}>
          <span className={s.masteryLabel}>SCORE</span>
          <span className={s.masteryValue} key={scoreKey}>
            {animatedScore.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
