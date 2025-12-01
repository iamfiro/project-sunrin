import { Globe } from "lucide-react";

import { VStack } from "@/shared/components";
import { FlexAlign, FlexJustify, HStack } from "@/shared/components/stack";
import { Track } from "@/shared/types/music";

import s from "./style.module.scss";

interface TrackCardProps extends Track {
  selected?: boolean;
}

export default function TrackCard({
  id,
  title,
  artist,
  coverSrc,
  community,
  selected = false,
}: TrackCardProps) {
  return (
    <a
      href={`/game/main?musicId=${id}`}
      className={`${s.container} ${selected ? s.selected : ""}`}
    >
      <HStack
        align={FlexAlign.Center}
        justify={FlexJustify.Between}
        className={`${s.trackCard} ${selected ? s.selected : ""}`}
        aria-selected={selected}
      >
        <HStack align={FlexAlign.Center} fullHeight gap={24}>
          <img src={coverSrc} alt={`${title} cover`} className={s.cover} />
          <VStack gap={6} className={s.info}>
            <h2 className={s.title}>{title}</h2>
            <p className={s.artist}>{artist}</p>
          </VStack>
        </HStack>
        {community && (
          <div className={s.community}>
            <Globe />
          </div>
        )}
      </HStack>
    </a>
  );
}
