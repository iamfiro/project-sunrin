import { VStack } from "@/shared/components";
import { FlexAlign, FlexJustify, HStack } from "@/shared/components/stack";

import s from "./style.module.scss";

interface Props {
  name: string;
  artist: string;
  coverUrl: string;

  bpm: number;
}

export default function GameInfo({ name, artist, coverUrl, bpm }: Props) {
  return (
    <div className={s.container}>
      <HStack className={s.info} gap={24}>
        <img src={coverUrl} alt={`${name} cover`} className={s.cover} />
        <VStack gap={4}>
          <span>{artist}</span>
          <p>{name}</p>
        </VStack>
      </HStack>
      <VStack align={FlexAlign.Start} gap={4} className={s.bpm}>
        <span>BPM</span>
        <p>{bpm}</p>
      </VStack>
    </div>
  );
}
