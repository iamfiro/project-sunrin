import { useEffect, useRef } from "react";

interface InputHandlerProps {
  keys: [string, string, string, string];
  onKeyPress: (keyIndex: number, key: string) => void;
  onKeyRelease?: (keyIndex: number, key: string) => void;
}

export const InputHandler = ({
  keys,
  onKeyPress,
  onKeyRelease = () => {},
}: InputHandlerProps) => {
  const pressedKeys = useRef<Set<string>>(new Set());
  const keyToIndex = useRef(
    new Map<string, number>(
      keys.map((key, index) => [key.toLowerCase(), index]),
    ),
  );

  // Update keyToIndex when keys prop changes
  useEffect(() => {
    keyToIndex.current = new Map(
      keys.map((key, index) => [key.toLowerCase(), index]),
    );
  }, [keys]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const keyIndex = keyToIndex.current.get(key);

      if (keyIndex !== undefined && !pressedKeys.current.has(key)) {
        e.preventDefault();
        pressedKeys.current.add(key);
        onKeyPress(keyIndex, keys[keyIndex]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const keyIndex = keyToIndex.current.get(key);

      if (keyIndex !== undefined) {
        e.preventDefault();
        pressedKeys.current.delete(key);
        onKeyRelease(keyIndex, keys[keyIndex]);
      }
    };

    const handleBlur = () => {
      // Clear all pressed keys when window loses focus
      pressedKeys.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      pressedKeys.current.clear();
    };
  }, [keys, onKeyPress, onKeyRelease]);

  // This component doesn't render anything visible
  return null;
};

export default InputHandler;
