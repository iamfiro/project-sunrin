import { useResultStore } from "@/store/useResultStore";
import { useEffect, useState, useRef } from "react";

import s from "./style.module.scss";

export default function ComboDisplay() {
  const { combo } = useResultStore();
  const [currentCombo, setCurrentCombo] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (combo.length > 0) {
      const lastCombo = combo[combo.length - 1];
      const [, , count] = lastCombo.split("-").map(Number);
      
      // 콤보가 증가했을 때만 애니메이션 트리거
      if (count > currentCombo) {
        setAnimationKey(prev => prev + 1);
      }
      
      setCurrentCombo(count);

      // 콤보가 1 이상일 때만 표시
      if (count > 0) {
        setIsVisible(true);
        
        // 이전 타이머 클리어
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        
        // 3초 후 숨김
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } else {
        setIsVisible(false);
      }
    } else {
      setCurrentCombo(0);
      setIsVisible(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [combo, currentCombo]);

  if (!isVisible) return null;

  return (
    <div 
      className={s.container} 
      key={animationKey}
    >
      <span className={s.label}>COMBO</span>
      <p className={s.count}>{currentCombo}</p>
    </div>
  );
}
