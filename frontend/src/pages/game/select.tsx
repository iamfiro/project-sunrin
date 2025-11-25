import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

import { TrackCard, TrackCover } from "@/components/music";
import { BackgroundVideo, Header } from "@/shared/components";
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // ignore autoplay restrictions
      });
    }
  }, [currentIndex]);

  return (
    <>
      <div className={s.container}>
        <main className={s.main}>
          <Header user={mockUser} />
          <div className={s.content}>
            <div className={s.left}>
              <TrackCover {...mockTrack[0]} />
            </div>
            <div className={s.right}>
              <HStack
                align={FlexAlign.Center}
                gap={12}
                className={s.searchContainer}
              >
                <Search className={s.searchIcon} size={20} />
                <input
                  type="text"
                  placeholder="트랙 검색"
                  className={s.search}
                />
                <select name="" id="" className={s.select}>
                  <option value="1">최신순</option>
                  <option value="2">오래된 순</option>
                  <option value="3">가장 많이 한 트랙</option>
                </select>
              </HStack>
              <VStack gap={14} align={FlexAlign.End} fullWidth>
                {mockTrack.map((track) => (
                  <TrackCard
                    key={track.title}
                    {...track}
                    selected={selectedTrack.title === track.title}
                  />
                ))}
              </VStack>
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
      <BackgroundVideo src="/music/hebi - onward/background.mp4" />
    </>
  );
}
