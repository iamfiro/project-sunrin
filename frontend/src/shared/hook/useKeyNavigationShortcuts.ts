import { useEffect, useMemo } from "react";

type KeyNavigationShortcutsOptions = {
  onNext: () => void;
  onPrev: () => void;
  nextKeyCodes?: string[];
  prevKeyCodes?: string[];
};

const DEFAULT_PREV_KEY_CODES = ["KeyW"];
const DEFAULT_NEXT_KEY_CODES = ["KeyS"];

const isTypingTarget = (target: EventTarget | null): target is HTMLElement => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
};

export default function useKeyNavigationShortcuts({
  onNext,
  onPrev,
  nextKeyCodes = DEFAULT_NEXT_KEY_CODES,
  prevKeyCodes = DEFAULT_PREV_KEY_CODES,
}: KeyNavigationShortcutsOptions) {
  const prevKeySet = useMemo(
    () => new Set(prevKeyCodes.map((key) => key.toLowerCase())),
    [prevKeyCodes],
  );
  const nextKeySet = useMemo(
    () => new Set(nextKeyCodes.map((key) => key.toLowerCase())),
    [nextKeyCodes],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (isTypingTarget(event.target)) return;

      const keyCode = event.code.toLowerCase();
      if (prevKeySet.has(keyCode)) {
        event.preventDefault();
        onPrev();
        return;
      }

      if (nextKeySet.has(keyCode)) {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextKeySet, prevKeySet, onNext, onPrev]);
}
