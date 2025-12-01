import { VStack } from "@/shared/components";
import { FlexAlign, HStack } from "@/shared/components/stack";

import s from "./style.module.scss";

interface Props {
  name: string;
  artist: string;
  coverUrl: string;
  bpm: number;
  userBestScore: number | null;
}

export default function GameInfo({
  name,
  artist,
  coverUrl,
  bpm,
  userBestScore,
}: Props) {
  return (
    <div className={s.container}>
      <VStack className={s.info} gap={28}>
        <HStack gap={16} align={FlexAlign.Center}>
          <img src={coverUrl} alt={`${name} cover`} className={s.cover} />
          <VStack gap={4}>
            <span>{artist}</span>
            <p>{name}</p>
          </VStack>
        </HStack>
        <VStack gap={4}>
          <span>내 최고 기록</span>
          <p>{userBestScore !== null ? userBestScore.toLocaleString() : "-"}</p>
        </VStack>
      </VStack>
      <VStack align={FlexAlign.Start} gap={4} className={s.bpm}>
        <span>BPM</span>
        <p>{bpm}</p>
      </VStack>
    </div>
  );
}
