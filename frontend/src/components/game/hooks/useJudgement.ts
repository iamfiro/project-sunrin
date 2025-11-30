import { useRef, useState } from "react";

export const useJudgement = () => {
  const [judgement, setJudgement] = useState<string | null>(null);
  const [judgementId, setJudgementId] = useState(0);
  const judgementTimeoutRef = useRef<number | null>(null);

  const showJudgement = (judgement: string) => {
    setJudgement(judgement);
    // 판정이 발생하였지만 기존 State 내용과 같으면 React는 리렌더링을 하지 않습니다
    // 매번 고유한 ID를 생성하여 리렌더링을 유도합니다
    setJudgementId((prev) => prev + 1);
    if (judgementTimeoutRef.current) {
      clearTimeout(judgementTimeoutRef.current);
    }
    judgementTimeoutRef.current = window.setTimeout(() => {
      setJudgement(null);
    }, 1000);
  };

  return { judgement, judgementId, showJudgement };
};
