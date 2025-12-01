import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TrackCard, TrackCover } from "@/components/music";
import { filterCharts, getCharts } from "@/shared/api/chartService";
import { Header } from "@/shared/components";
import { FlexAlign, HStack, VStack } from "@/shared/components/stack";
import useKeyNavigationShortcuts from "@/shared/hook/useKeyNavigationShortcuts";
import { Chart, ChartSortOption } from "@/shared/types/chart";

import s from "@/shared/styles/pages/game/select.module.scss";

// API 응답의 coverUrl을 전체 URL로 변환
const API_BASE = "http://localhost:8000";

export default function SongSelect() {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<ChartSortOption>("latest");

  const [currentIndex, setCurrentIndex] = useState(0);

  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const filteredCharts = useMemo(() => {
    return filterCharts(charts, searchQuery, sortOption);
  }, [charts, searchQuery, sortOption]);

  const currentChart = filteredCharts[currentIndex];

  const next = useCallback(() => {
    if (filteredCharts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredCharts.length);
  }, [filteredCharts.length]);

  const prev = useCallback(() => {
    if (filteredCharts.length === 0) return;
    setCurrentIndex((prev) =>
      prev === 0 ? filteredCharts.length - 1 : prev - 1,
    );
  }, [filteredCharts.length]);

  useKeyNavigationShortcuts({
    onNext: next,
    onPrev: prev,
    nextKeyCodes: ["KeyS"],
    prevKeyCodes: ["KeyW"],
  });

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery, sortOption]);

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
    if (!video || !currentChart) return;

    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Video autoplay prevented or failed:", error);
      });
    }
  }, [currentChart]);

  useEffect(() => {
    setLoading(true);
    getCharts()
      .then((data) => {
        setCharts(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("차트를 불러오는데 실패했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 첫 사용자 상호작용 시 음소거 해제
  useEffect(() => {
    const handleUserInteraction = () => {
      setIsMuted(false);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  if (loading) {
    return (
      <div className={s.container}>
        <main className={s.main}>
          <Header />
          <div className={s.loadingContainer}>
            <p>로딩 중...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.container}>
        <main className={s.main}>
          <Header />
          <div className={s.errorContainer}>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={s.container}>
      {currentChart && (
        <video
          autoPlay
          loop
          className={s.video}
          disablePictureInPicture={true}
          ref={videoRef}
          muted={isMuted}
          playsInline
          onClick={() => setIsMuted(false)}
        >
          <source
            key={currentChart.backgroundVideo}
            src={`${API_BASE}${currentChart.backgroundVideo}`}
            type="video/mp4"
          />
        </video>
      )}
      <main className={s.main}>
        <Header />
        <div className={s.content}>
          <div className={s.left}>
            {currentChart && (
              <TrackCover
                title={currentChart.title}
                artist={currentChart.artist}
                bpm={currentChart.bpm}
                coverSrc={`${API_BASE}${currentChart.coverUrl}`}
                community={currentChart.isCommunitySong}
                cdSrc={`${API_BASE}${currentChart.coverUrl}`}
                difficulties={[]}
                playTime={0}
                backgroundVideoSrc={`${API_BASE}${currentChart.backgroundVideo}`}
                userBestRecord={currentChart.userBestRecord}
                ranks={currentChart.ranks.map((rank, idx) => ({
                  user: {
                    id: String(rank.user.id),
                    name: rank.user.username,
                    profileImage:
                      rank.user.profileImage || "/images/default-profile.png",
                    stats: { perfectCount: 0, highestScore: 0 },
                  },
                  username: rank.user.username,
                  rank: idx + 1,
                  score: rank.score,
                }))}
              />
            )}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className={s.select}
                value={sortOption}
                onChange={(e) =>
                  setSortOption(e.target.value as ChartSortOption)
                }
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된 순</option>
                <option value="mostPlayed">가장 많이 한 트랙</option>
              </select>
            </HStack>
            <div className={s.trackListViewport}>
              <VStack
                gap={14}
                align={FlexAlign.End}
                fullWidth
                className={s.trackList}
              >
                {filteredCharts.length === 0 ? (
                  <div className={s.noResults}>
                    <p>검색 결과가 없습니다.</p>
                  </div>
                ) : (
                  filteredCharts.map((chart, idx) => (
                    <div
                      key={chart.id}
                      className={s.trackListItem}
                      ref={(element) => {
                        trackRefs.current[idx] = element;
                      }}
                    >
                      <TrackCard
                        title={chart.title}
                        artist={chart.artist}
                        coverSrc={`${API_BASE}${chart.coverUrl}`}
                        community={chart.isCommunitySong}
                        bpm={chart.bpm}
                        difficulties={[]}
                        playTime={0}
                        cdSrc=""
                        backgroundVideoSrc=""
                        selected={idx === currentIndex}
                      />
                    </div>
                  ))
                )}
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
