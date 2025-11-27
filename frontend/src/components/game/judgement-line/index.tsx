import { useJudgementLineStore } from "@/store/useJudgementLineStore";

import s from "./style.module.scss";

export default function JudgementLine() {
  const { currentTiming, currentType, isAnimating } = useJudgementLineStore();

  // timing: -1 (왼쪽 끝) ~ 0 (중앙) ~ 1 (오른쪽 끝)
  // 판정 윈도우에 맞춰 position 계산
  // perfect: ±30ms (±0.2) → 40% ~ 60%
  // great: ±60ms (±0.4) → 20% ~ 80%
  // good: ±100ms (±0.667) → 0% ~ 100%
  // miss: 맨 왼쪽(0%) 또는 맨 오른쪽(100%)
  const position = 50 + currentTiming * 50;

  return (
    <div className={s.container}>
      <div className={s.timingBar}>
        <div className={s.earlyZone} />

        <div className={s.perfectZone}>
          <div className={s.centerLine} />
        </div>

        <div className={s.lateZone} />
      </div>

      <div className={s.indicatorWrapper}>
        <div
          className={`${s.movingIndicator} ${s[currentType]} ${isAnimating ? s.active : ""}`}
          style={{
            left: `${position}%`,
          }}
        />
      </div>
    </div>
  );
}
