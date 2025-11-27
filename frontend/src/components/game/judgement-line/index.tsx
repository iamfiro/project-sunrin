import { useJudgementLineStore } from "@/store/useJudgementLineStore";

import s from "./style.module.scss";

export default function JudgementLine() {
  const { currentTiming, currentType, isAnimating } = useJudgementLineStore();

  // timing: -1 (왼쪽 끝) ~ 0 (중앙) ~ 1 (오른쪽 끝)
  // 50% 기준으로 변환
  const position = 50 + currentTiming * 45; // -45% ~ 0 ~ +45%

  return (
    <div className={s.container}>
      {/* 타이밍 바 배경 */}
      <div className={s.timingBar}>
        {/* Early 영역 (왼쪽) */}
        <div className={s.earlyZone}>
        </div>

        {/* Perfect 영역 (가운데) - 기준선 */}
        <div className={s.perfectZone}>
          <div className={s.centerLine} />
        </div>

        {/* Late 영역 (오른쪽) */}
        <div className={s.lateZone}></div>
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
