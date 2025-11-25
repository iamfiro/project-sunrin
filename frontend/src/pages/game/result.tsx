import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useResultStore } from "@/store/useResultStore";

export default function GameResult() {
  const navigate = useNavigate();

  const accuracy = useResultStore((state) => state.accuracy);
  const rank = useResultStore((state) => state.rank);
  const score = useResultStore((state) => state.score);
  const combo = useResultStore((state) => state.combo);
  const hasValidResult = useResultStore((state) => state.hasValidResult);

  useEffect(() => {
    if (!hasValidResult()) {
      navigate("/game", { replace: true });
    }
  }, [accuracy, rank, score, hasValidResult, navigate]); // ⭐ 매우 중요

  return (
    <div>
      <h1>게임 결과</h1>
      <div>정확도: {accuracy}%</div>
      <div>랭크: {rank}</div>
      <div>점수: {score}</div>
      <div>콤보: {combo.length}</div>
      <button onClick={() => navigate("/game/main")}>다시하기</button>
    </div>
  );
}
