import { useEffect, useRef } from "react";

import { useInputStore } from "@/store/inputStore";

/**
 * 키보드 입력 처리 (물리적 키 코드 기반)
 */
export const useKeyboardInput = (
  handleKeyPress: (keyIndex: number) => void,
) => {
  const { keyCodes, pressKey, releaseKey } = useInputStore();
  const handleKeyPressRef = useRef(handleKeyPress);

  // handleKeyPress가 변경되면 ref 업데이트
  useEffect(() => {
    handleKeyPressRef.current = handleKeyPress;
  }, [handleKeyPress]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 키 반복 입력 방지
      if (e.repeat) return;

      // e.code를 사용하여 물리적 키 위치 감지 (언어 독립적)
      const keyIndex = keyCodes.indexOf(e.code);

      if (keyIndex !== -1) {
        pressKey(keyIndex);
        handleKeyPressRef.current(keyIndex);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyIndex = keyCodes.indexOf(e.code);
      if (keyIndex !== -1) {
        releaseKey(keyIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyCodes, pressKey, releaseKey]);
};
