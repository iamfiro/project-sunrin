import { useEffect, useRef, useState } from "react";

export const useGameTimer = () => {
  const [scroll, setScroll] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(countdownTimer);
    } else if (countdown === 0 && !isGameStarted) {
      // 카운트다운 종료 후 게임 시작
      setIsGameStarted(true);
    }
  }, [countdown, isGameStarted]);

  useEffect(() => {
    if (!isGameStarted) return;

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
  }, [isGameStarted]);

  return { scroll, startTimeRef, countdown, isGameStarted };
};
