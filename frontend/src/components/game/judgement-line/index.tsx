import { useJudgementLineStore } from "@/store/useJudgementLineStore";

import s from "./style.module.scss";

export default function JudgementLine() {
  const { indicators } = useJudgementLineStore();

  return (
    <div className={s.container}>
      {/* 타이밍 바 배경 */}
      <div className={s.timingBar}>
        {/* Early 영역 (왼쪽) */}
        <div className={s.earlyZone}>
          <span className={s.label}>EARLY</span>
        </div>

        {/* Perfect 영역 (가운데) */}
        <div className={s.perfectZone}>
          <div className={s.perfectIndicator} />
        </div>

        {/* Late 영역 (오른쪽) */}
        <div className={s.lateZone}>
          <span className={s.label}>LATE</span>
        </div>
      </div>

      {/* 타이밍 인디케이터들 */}
      <div className={s.indicators}>
        {indicators.map((indicator) => {
          // timing: -1 (왼쪽 끝) ~ 0 (중앙) ~ 1 (오른쪽 끝)
          // 50% 기준으로 변환
          const position = 50 + indicator.timing * 45; // -45% ~ 0 ~ +45%

          return (
            <div
              key={indicator.id}
              className={`${s.indicator} ${s[indicator.type]}`}
              style={{
                left: `${position}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
