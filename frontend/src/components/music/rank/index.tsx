import { HStack } from "@/shared/components";
import { FlexAlign, FlexJustify, VStack } from "@/shared/components/stack";
import { TrackRank as TrackRankType } from "@/shared/types/rank";

import s from "./style.module.scss";

interface Props {
  rank: TrackRankType;
  me?: boolean;
}

export default function TrackRank({ rank, me }: Props) {
  console.log(rank);
  return (
    <HStack
      align={FlexAlign.Center}
      justify={FlexJustify.Between}
      gap={12}
      className={s.trackRank}
      data-me={me}
    >
      <HStack align={FlexAlign.Center} gap={12}>
        <img
          src={rank.user.profileImage}
          alt={rank.user.name}
          className={s.profileImage}
        />
        <VStack gap={4}>
          <span className={s.name}>
            {me ? `나 (${rank.user.name})` : rank.user.name}
          </span>
          <span className={s.score}>{rank.score}점</span>
        </VStack>
      </HStack>
      <span className={s.rank}>#{rank.rank}</span>
    </HStack>
  );
}
