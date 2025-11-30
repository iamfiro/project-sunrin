import { useEffect } from "react";

const useUndoRedoKeys = (undo: () => void, redo: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { metaKey, ctrlKey, key, shiftKey } = event;
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmd = isMac ? metaKey : ctrlKey;

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (isCmd && key.toLowerCase() === "z") {
        event.preventDefault();
        if (shiftKey) {
          // Cmd+Shift+Z is often redo on Mac
          redo();
        } else {
          undo();
        }
      } else if (isCmd && key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);
};

export default useUndoRedoKeys;
