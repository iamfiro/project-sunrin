import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

import { TrackCard, TrackCover } from "@/components/music";
import { Header } from "@/shared/components";
import { FlexAlign, HStack, VStack } from "@/shared/components/stack";
import useCircularIndex from "@/shared/hook/useCircularIndex";
import useKeyNavigationShortcuts from "@/shared/hook/useKeyNavigationShortcuts";
import { mockTrack } from "@/shared/mock/music";
import { mockUser } from "@/shared/mock/user";
import { Track } from "@/shared/types/music";

import s from "@/shared/styles/pages/game/select.module.scss";

export default function SongSelect() {
  const { currentIndex, next, prev } = useCircularIndex<Track>(mockTrack, {
    initialIndex: 0,
  });
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);

  useKeyNavigationShortcuts({
    onNext: next,
    onPrev: prev,
    nextKeyCodes: ["KeyS"],
    prevKeyCodes: ["KeyW"],
  });

  useEffect(() => {
    const target = trackRefs.current[currentIndex];
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [currentIndex]);

  return (
    <div className={s.container}>
      <video autoPlay loop className={s.video} disablePictureInPicture={true}>
        <source src="/music/hebi - onward/background.mp4" type="video/mp4" />
      </video>
      <main className={s.main}>
        <Header user={mockUser} />
        <div className={s.content}>
          <div className={s.left}>
            <TrackCover {...mockTrack[currentIndex]} />
          </div>
          <div className={s.right}>
            <HStack
              align={FlexAlign.Center}
              gap={12}
              className={s.searchContainer}
            >
              <Search className={s.searchIcon} size={20} />
              <input type="text" placeholder="트랙 검색" className={s.search} />
              <select name="" id="" className={s.select}>
                <option value="1">최신순</option>
                <option value="2">오래된 순</option>
                <option value="3">가장 많이 한 트랙</option>
              </select>
            </HStack>
            <div className={s.trackListViewport}>
              <VStack
                gap={14}
                align={FlexAlign.End}
                fullWidth
                className={s.trackList}
              >
                {mockTrack.map((track, idx) => (
                  <div
                    key={track.title}
                    className={s.trackListItem}
                    ref={(element) => {
                      trackRefs.current[idx] = element;
                    }}
                  >
                    <TrackCard {...track} selected={idx === currentIndex} />
                  </div>
                ))}
              </VStack>
            </div>
          </div>
        </div>
        <footer className={s.footer}>
          <HStack align={FlexAlign.Center} gap={8}>
            <img
              src="/images/keyboard/keyboard_updown.svg"
              alt="updown"
              height={22}
            />
            <span>Change Music</span>
          </HStack>
        </footer>
      </main>
    </div>
  );
}
