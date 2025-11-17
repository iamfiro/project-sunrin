import { Lock } from "lucide-react";

import { VStack } from "@/shared/components";
import { TrackDifficulty, TrackDifficultyEnum } from "@/shared/types/music";

import s from "./style.module.scss";

interface Props extends TrackDifficulty {
  selected: TrackDifficultyEnum;
  setSelected: (difficulty: TrackDifficultyEnum) => void;
}

export default function Difficulty({
  difficulty,
  unlocked,
  level,
  selected,
  setSelected,
}: Props) {
  const difficultyText =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <VStack
      className={s.difficulty}
      data-difficulty={difficulty}
      data-selected={selected}
      onClick={() => setSelected(difficulty)}
    >
      <div>
        <span>{difficultyText}</span>
      </div>
      <div>{unlocked ? <p>{level}</p> : <Lock size={24} />}</div>
    </VStack>
  );
}
