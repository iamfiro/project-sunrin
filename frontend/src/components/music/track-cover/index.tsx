import { Globe } from "lucide-react";

import { HStack } from "@/shared/components";
import { FlexAlign, FlexJustify, VStack } from "@/shared/components/stack";
import { Track } from "@/shared/types/music";

import TrackRank from "../rank";

import s from "./style.module.scss";

const DEFAULT_CD_HOLE = "/images/music/CD Hole.png";

// 랭크에 따른 이미지 매핑
const RANK_IMAGES: Record<string, string> = {
  SS: "/images/rank/master.png",
  S: "/images/rank/master.png",
  A: "/images/rank/master.png",
  B: "/images/rank/master.png",
  C: "/images/rank/master.png",
  D: "/images/rank/master.png",
  F: "/images/rank/master.png",
};

// 콤보 문자열에서 최대 콤보 추출
const getMaxCombo = (comboStr: string): number => {
  if (!comboStr) return 0;
  const combos = comboStr.split(",").map((s) => parseInt(s.trim(), 10));
  return Math.max(...combos.filter((n) => !isNaN(n)), 0);
};

export default function MusicAlbumCover({
  title,
  artist,
  bpm,
  coverSrc,
  community,
  cdSrc,
  ranks,
  userBestRecord,
}: Track) {
  const hasRecord = userBestRecord != null;
  const rankImage = hasRecord
    ? RANK_IMAGES[userBestRecord.rank] || "/images/rank/master.png"
    : "/images/rank/master.png";
  const maxCombo = hasRecord ? getMaxCombo(userBestRecord.combo) : 0;

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
          <img src={rankImage} alt="rank" />
          <VStack gap={4}>
            <span>MASTERY</span>
            <p className={s.masteryLevel}>
              {hasRecord ? userBestRecord.score.toLocaleString() : "-"}
            </p>
          </VStack>
        </HStack>
        <VStack gap={6}>
          <HStack align={FlexAlign.Center} gap={6}>
            <span>정확도</span>
            <p>{hasRecord ? `${userBestRecord.accuracy.toFixed(2)}%` : "-"}</p>
          </HStack>
          <HStack align={FlexAlign.Center} gap={6}>
            <span>콤보</span>
            <p>{hasRecord ? maxCombo.toLocaleString() : "-"}</p>
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
