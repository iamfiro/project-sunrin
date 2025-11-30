import { useEffect, useState } from "react";

import { useResultStore } from "@/store/useResultStore";

import s from "./style.module.scss";

export default function ComboDisplay() {
  const { combo } = useResultStore();
  const [currentCombo, setCurrentCombo] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [isComboIncreasing, setIsComboIncreasing] = useState(false);

  useEffect(() => {
    // combo 배열의 마지막 요소에서 현재 콤보 수를 가져옴
    if (combo.length > 0) {
      const lastCombo = combo[combo.length - 1];
      const comboCount = parseInt(lastCombo.split("-")[2]);

      console.log("🎮 Combo Debug:", {
        comboArray: combo,
        lastCombo,
        comboCount,
        currentCombo,
      });

      if (comboCount !== currentCombo) {
        setIsComboIncreasing(comboCount > currentCombo);
        setCurrentCombo(comboCount);
        setAnimationKey((prev) => prev + 1);
      }
    } else {
      setCurrentCombo(0);
    }
  }, [combo, currentCombo]);

  if (currentCombo < 2) {
    return null;
  }

  const comboRange = currentCombo >= 50 ? "high" : "normal";

  return (
    <div
      className={`${s.comboContainer} ${isComboIncreasing ? s.increase : s.break}`}
      key={animationKey}
      data-combo-range={comboRange}
    >
      <span className={s.comboNumber}>{currentCombo}</span>
      <span className={s.comboLabel}>COMBO</span>
    </div>
  );
}
