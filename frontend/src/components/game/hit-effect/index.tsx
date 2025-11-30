import { memo, useEffect, useRef } from "react";

import s from "./style.module.scss";

export type JudgementType = "perfect" | "great" | "good" | "miss";

interface HitEffectProps {
  judgement: JudgementType | null;
  position?: number;
  show?: boolean;
  onComplete?: () => void;
}

// 판정별 이펙트 지속 시간
const DURATION_MAP: Record<JudgementType, number> = {
  perfect: 280,
  great: 240,
  good: 180,
  miss: 0,
};

const HitEffect = memo(
  ({ judgement, position = 50, show = false, onComplete }: HitEffectProps) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      if (show && judgement && judgement !== "miss") {
        timerRef.current = setTimeout(
          () => onComplete?.(),
          DURATION_MAP[judgement],
        );
      }
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [show, judgement, onComplete]);

    if (!show || !judgement || judgement === "miss") return null;

    // Good: 최소 DOM (flash + ring만)
    if (judgement === "good") {
      return (
        <div
          className={`${s.hitEffect} ${s.good}`}
          style={{ left: `${position}%` }}
        >
          <div className={s.flashCore} />
          <div className={s.ring} />
        </div>
      );
    }

    // Great: flash + ring + secondary
    if (judgement === "great") {
      return (
        <div
          className={`${s.hitEffect} ${s.great}`}
          style={{ left: `${position}%` }}
        >
          <div className={s.flashCore} />
          <div className={s.ring} />
          <div className={s.ringSecondary} />
        </div>
      );
    }

    // Perfect: 풀 이펙트
    return (
      <div
        className={`${s.hitEffect} ${s.perfect}`}
        style={{ left: `${position}%` }}
      >
        <div className={s.flashCore} />
        <div className={s.ring} />
        <div className={s.ringSecondary} />
        <div className={s.arc1} />
        <div className={s.arc2} />
      </div>
    );
  },
);

HitEffect.displayName = "HitEffect";

export default HitEffect;
