import { memo } from "react";

import s from "./style.module.scss";

interface KeyPressIndicatorProps {
  pressedKeys: Set<number>;
}

// 키 레이블 (4키 기준)
const KEY_LABELS = ["D", "F", "J", "K"];

const KeyPressIndicator = memo(({ pressedKeys }: KeyPressIndicatorProps) => {
  return (
    <div className={s.container}>
      {KEY_LABELS.map((label, index) => {
        const isPressed = pressedKeys.has(index);
        return (
          <div
            key={index}
            className={`${s.keyButton} ${isPressed ? s.pressed : ""}`}
          >
            <span className={s.keyLabel}>{label}</span>
            {isPressed && <div className={s.pressGlow} />}
          </div>
        );
      })}
    </div>
  );
});

KeyPressIndicator.displayName = "KeyPressIndicator";

export default KeyPressIndicator;
