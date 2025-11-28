import { useEffect, useRef } from "react";

import { useInputStore } from "@/store/inputStore";

export const useKeyboardInput = (
  handleKeyPress: (keyIndex: number) => void,
) => {
  const { keyCodes, pressKey, releaseKey } = useInputStore();
  const handleKeyPressRef = useRef(handleKeyPress);

  useEffect(() => {
    handleKeyPressRef.current = handleKeyPress;
  }, [handleKeyPress]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      
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
