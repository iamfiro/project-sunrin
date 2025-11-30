import { useRef, useState } from "react";

import { GameInfo, GameStats, JudgementLine } from "@/components/game";
import PlayField from "@/components/game/play-field";
import { BackgroundVideo } from "@/shared/components";
import { mockTrack } from "@/shared/mock/music";

import s from "@/shared/styles/pages/game/main.module.scss";

export default function GameMain() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const videoEndHandlerRef = useRef<(() => void) | null>(null);

  const handleVideoEndCallback = (handler: () => void) => {
    videoEndHandlerRef.current = handler;
  };

  const handleVideoEnded = () => {
    if (videoEndHandlerRef.current) {
      videoEndHandlerRef.current();
    }
  };

  return (
    <>
      <div className={s.container}>
        <GameInfo
          name={mockTrack[0].title}
          artist={mockTrack[0].artist}
          coverUrl={mockTrack[0].coverSrc}
          bpm={120}
        />
        <GameStats />
        <div className={s.playFieldWrap}>
          <div className={s.playFieldContainer}>
            <PlayField
              onGameStarted={setIsGameStarted}
              onVideoEndCallback={handleVideoEndCallback}
            />
            <div className={s.playFieldInfo}>
              <div className={s.judgementLine}>
                <JudgementLine />
              </div>
            </div>
          </div>
        </div>
      </div>
      <BackgroundVideo
        src="/music/hebi - onward/background.mp4"
        isPaused={!isGameStarted}
        loop={false}
        onEnded={handleVideoEnded}
      />
    </>
  );
}
