import { useJudgementLineStore } from "@/store/useJudgementLineStore";

import s from "./style.module.scss";

export default function JudgementLine() {
  const { currentTiming, currentType, isAnimating } = useJudgementLineStore();

  // timing: -1 (왼쪽 끝) ~ 0 (중앙) ~ 1 (오른쪽 끝)
  // 판정 윈도우에 맞춰 position 계산
  // perfect: ±30ms (±0.2) → 41% ~ 59%
  // great: ±60ms (±0.4) → 32% ~ 68%
  // good: ±100ms (±0.667) → 20% ~ 80%
  // miss: ±150ms (±1.0) → 5% ~ 95%
  const position = 50 + currentTiming * 45; // 50% ± 45%

  return (
    <div className={s.container}>
      {/* 타이밍 바 배경 */}
      <div className={s.timingBar}>
        {/* Early 영역 (왼쪽) */}
        <div className={s.earlyZone}>
          <span className={s.label}>EARLY</span>
        </div>

        {/* Perfect 영역 (가운데) - 기준선 */}
        <div className={s.perfectZone}>
          <div className={s.centerLine} />
        </div>

        {/* Late 영역 (오른쪽) */}
        <div className={s.lateZone}>
          <span className={s.label}>LATE</span>
        </div>
      </div>

      {/* 움직이는 타이밍 인디케이터 */}
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
