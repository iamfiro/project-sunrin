import { useRef, useState } from "react";

/**
 * 판정 표시 관리
 */
export const useJudgement = () => {
  const [judgement, setJudgement] = useState<string | null>(null);
  const [judgementId, setJudgementId] = useState(0);
  const judgementTimeoutRef = useRef<number | null>(null);

  const showJudgement = (judgement: string) => {
    setJudgement(judgement);
    setJudgementId((prev) => prev + 1); // 매번 고유한 ID 생성
    if (judgementTimeoutRef.current) {
      clearTimeout(judgementTimeoutRef.current);
    }
    judgementTimeoutRef.current = window.setTimeout(() => {
      setJudgement(null);
    }, 1000);
  };

  return { judgement, judgementId, showJudgement };
};
