import React, { memo, useEffect, useRef } from "react";

import styles from "./style.module.scss";

export type JudgementType = "perfect" | "great" | "good" | "miss";

interface HitEffectProps {
  judgement: JudgementType | null;
  position?: number;
  duration?: number;
  show?: boolean;
  onComplete?: () => void;
}

// 판정별 이펙트 지속 시간
const DURATION_MAP: Record<JudgementType, number> = {
  perfect: 280,
  great: 240,
  good: 200,
  miss: 0,
};

const HitEffect: React.FC<HitEffectProps> = memo(
  ({ judgement, position = 50, duration, show = false, onComplete }) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const effectDuration =
      duration ?? (judgement ? DURATION_MAP[judgement] : 240);

    useEffect(() => {
      if (show && judgement && judgement !== "miss") {
        timerRef.current = setTimeout(() => {
          onComplete?.();
        }, effectDuration);
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [show, judgement, effectDuration, onComplete]);

    if (!show || !judgement || judgement === "miss") {
      return null;
    }

    return (
      <div
        className={`${styles.hitEffect} ${styles[judgement]}`}
        style={{ left: `${position}%` }}
      >
        {/* 중앙 플래시 코어 */}
        <div className={styles.flashCore} />

        {/* 외곽 링 */}
        <div className={styles.ring} />

        {/* 세컨더리 링 */}
        <div className={styles.ringSecondary} />

        {/* 아크 (레이더 효과) - 2개로 축소 */}
        <div className={styles.arc1} />
        <div className={styles.arc2} />
      </div>
    );
  },
);

HitEffect.displayName = "HitEffect";

export default HitEffect;
