import { useCallback, useEffect, useMemo, useState } from "react";

interface Options {
  initialIndex?: number;
}

function normalizeIndex(index: number, length: number) {
  if (length === 0) return 0;

  const mod = index % length;
  return mod >= 0 ? mod : mod + length;
}

export default function useCircularIndex<T>(array: T[], options: Options = {}) {
  const { initialIndex = 0 } = options;
  const length = array.length;

  const [index, setIndex] = useState(() =>
    normalizeIndex(initialIndex, length),
  );

  useEffect(() => {
    setIndex((current) => normalizeIndex(current, length));
  }, [length]);

  const next = useCallback(() => {
    if (length === 0) return;
    setIndex((current) => (current + 1) % length);
  }, [length]);

  const prev = useCallback(() => {
    if (length === 0) return;
    setIndex((current) => (current - 1 + length) % length);
  }, [length]);

  const set = useCallback(
    (newIndex: number) => {
      if (length === 0) return;
      setIndex(normalizeIndex(newIndex, length));
    },
    [length],
  );

  const current = useMemo(() => {
    if (length === 0) return undefined;
    return array[index];
  }, [array, index, length]);

  return {
    length,
    currentIndex: index,
    current,
    next,
    prev,
    set,
  };
}
