import { useEffect, useRef, useState } from "react";

export const useGameTimer = () => {
  const [scroll, setScroll] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      const currentTime = timestamp - startTimeRef.current;
      setScroll(currentTime);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return { scroll, startTimeRef };
};


