import { useEffect, useState } from "react";

import s from "./style.module.scss";

interface JudgementProps {
  judgement: string | null;
  judgementId?: number;
}

export default function Judgement({ judgement, judgementId }: JudgementProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (judgement) {
      // 판정이 발생할 때마다 key를 변경하여 애니메이션 재시작
      setAnimationKey((prev) => prev + 1);
    }
  }, [judgement, judgementId]);

  if (!judgement) return null;

  // 판정 종류에 따라 클래스 추가
  const judgementClass = judgement.toLowerCase();

  return (
    <span
      key={animationKey}
      className={`${s.judgement} ${s[judgementClass] || ""}`}
    >
      {judgement}
    </span>
  );
}
