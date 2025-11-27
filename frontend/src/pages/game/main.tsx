import { useEffect } from "react";

import { GameInfo, GameStats } from "@/components/game";
import PlayField from "@/components/game/play-field";
import { BackgroundVideo } from "@/shared/components";
import { mockTrack } from "@/shared/mock/music";
import { useInputStore } from "@/store/inputStore";

import s from "@/shared/styles/pages/game/main.module.scss";

export default function GameMain() {
  const { pressedKeys, getPressedKeyCodes } = useInputStore();

  // Log when pressed keys change
  useEffect(() => {
    const keyCodes = getPressedKeyCodes();
    console.log(`Pressed keys: ${keyCodes.join(", ") || "None"}`);
  }, [pressedKeys, getPressedKeyCodes]);

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
        {/* <Header user={mockUser} /> */}
        <PlayField />
      </div>
      <BackgroundVideo src="/music/hebi - onward/background.mp4" />
    </>
  );
}
