import { memo, useMemo } from "react";

import s from "./style.module.scss";

interface KeyPressIndicatorProps {
  pressedKeys: Set<number>;
}

// 키 레이블 (4키 기준)
const KEY_LABELS = ["D", "F", "J", "K"] as const;

// 개별 키 버튼 컴포넌트 (메모이제이션)
const KeyButton = memo(
  ({ label, isPressed }: { label: string; isPressed: boolean }) => (
    <div className={`${s.keyButton} ${isPressed ? s.pressed : ""}`}>
      <span className={s.keyLabel}>{label}</span>
      {isPressed && <div className={s.pressGlow} />}
    </div>
  ),
);
KeyButton.displayName = "KeyButton";

const KeyPressIndicator = memo(
  ({ pressedKeys }: KeyPressIndicatorProps) => {
    // pressedKeys를 배열로 변환해서 비교 최적화
    const pressedArray = useMemo(
      () => [
        pressedKeys.has(0),
        pressedKeys.has(1),
        pressedKeys.has(2),
        pressedKeys.has(3),
      ],
      [pressedKeys],
    );

    return (
      <div className={s.container}>
        {KEY_LABELS.map((label, index) => (
          <KeyButton
            key={index}
            label={label}
            isPressed={pressedArray[index]}
          />
        ))}
      </div>
    );
  },
  // 커스텀 비교 함수
  (prevProps, nextProps) => {
    const prev = prevProps.pressedKeys;
    const next = nextProps.pressedKeys;
    return (
      prev.has(0) === next.has(0) &&
      prev.has(1) === next.has(1) &&
      prev.has(2) === next.has(2) &&
      prev.has(3) === next.has(3)
    );
  },
);

KeyPressIndicator.displayName = "KeyPressIndicator";

export default KeyPressIndicator;

