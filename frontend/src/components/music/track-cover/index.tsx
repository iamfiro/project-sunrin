import { Globe } from "lucide-react";

import { HStack } from "@/shared/components";
import { FlexAlign, FlexJustify, VStack } from "@/shared/components/stack";
import { mockTrack } from "@/shared/mock/music";
import { mockUser } from "@/shared/mock/user";
import { Track } from "@/shared/types/music";

import TrackRank from "../rank";

import s from "./style.module.scss";

const DEFAULT_CD_HOLE = "/images/music/CD Hole.png";

export default function MusicAlbumCover({
  title,
  artist,
  bpm,
  coverSrc,
  community,
  cdSrc,
  ranks,
}: Track) {
  return (
    <div className={s.music}>
      <div className={s.coverContainer}>
        <div className={s.cd}>
          <img src={cdSrc} alt={`${title} cd`} className={s.cdImage} />
          <img src={DEFAULT_CD_HOLE} alt="cd hole" className={s.cdHole} />
        </div>
        <div className={s.coverWrapper}>
          <img src={coverSrc} alt={`${title} cover`} className={s.cover} />
          {community && (
            <HStack align={FlexAlign.Center} gap={8} className={s.community}>
              <Globe size={22} />
              <span>커뮤니티 음악</span>
            </HStack>
          )}
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
      <VStack gap={6} fullWidth>
        {ranks?.map((rank) => (
          <TrackRank key={rank.rank} rank={rank} />
        ))}
      </VStack>
    </div>
  );
}
