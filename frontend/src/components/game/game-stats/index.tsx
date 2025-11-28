import s from "./style.module.scss";

interface GameStatsProps {
  score: number;
  combo: number;
}

export default function GameStats({ score, combo }: GameStatsProps) {
  return (
    <div className={s.container}>
      <div className={s.score}>Score: {score}</div>
      <div className={s.combo}>Combo: {combo}</div>
    </div>
  );
}
