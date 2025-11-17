import { Globe } from "lucide-react";
import { useState } from "react";

import { HStack } from "@/shared/components";
import { FlexAlign, FlexJustify, VStack } from "@/shared/components/stack";
import { Track, TrackDifficultyEnum } from "@/shared/types/music";

import Difficulty from "../difficulty";

import s from "./style.module.scss";

const DEFAULT_CD_HOLE = "/images/music/CD Hole.png";

export default function MusicAlbumCover({
  title,
  artist,
  bpm,
  coverSrc,
  difficulties,
  cdSrc,
}: Track) {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<TrackDifficultyEnum>(
      difficulties[0]?.difficulty ?? TrackDifficultyEnum.EASY,
    );

  return (
    <div className={s.music}>
      <div className={s.coverContainer}>
        <div className={s.cd}>
          <img src={cdSrc} alt={`${title} cd`} className={s.cdImage} />
          <img src={DEFAULT_CD_HOLE} alt="cd hole" className={s.cdHole} />
        </div>
        <div className={s.coverWrapper}>
          <img src={coverSrc} alt={`${title} cover`} className={s.cover} />
          <div className={s.community}>
            <Globe size={26} />
            <span>커뮤니티 음악</span>
          </div>
        </div>
      </div>
      <div className={s.info}>
        <h1 className={s.title}>{title}</h1>
        <p className={s.artist}>
          {artist} · {bpm} BPM
        </p>
      </div>
      <HStack
        className={s.card}
        align={FlexAlign.Center}
        justify={FlexJustify.Between}
        gap={6}
      >
        <HStack align={FlexAlign.Center} gap={6}>
          <img src="/images/rank/master.png" alt="master" />
          <VStack gap={4}>
            <span>MASTERY</span>
            <p className={s.masteryLevel}>102392</p>
          </VStack>
        </HStack>
        <VStack gap={6}>
          <HStack align={FlexAlign.Center} gap={6}>
            <span>정확도</span>
            <p>99.999%</p>
          </HStack>
          <HStack align={FlexAlign.Center} gap={6}>
            <span>콤보</span>
            <p>102392</p>
          </HStack>
        </VStack>
      </HStack>
      <HStack gap={16}>
        {difficulties.map((difficulty) => (
          <Difficulty
            key={difficulty.difficulty}
            {...difficulty}
            selected={selectedDifficulty}
            setSelected={setSelectedDifficulty}
          />
        ))}
      </HStack>
    </div>
  );
}
