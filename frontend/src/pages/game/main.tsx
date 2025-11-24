import { useEffect } from "react";

import PlayField from "@/components/game/play-field";
import { BackgroundVideo } from "@/shared/components";
import { useInputStore } from "@/store/inputStore";

import s from "@/shared/styles/pages/game/main.module.scss";

export default function GameMain() {
  const { pressedKeys, getPressedKeyNames } = useInputStore();

  // Log when pressed keys change
  useEffect(() => {
    const keyNames = getPressedKeyNames();
    console.log(`Pressed keys: ${keyNames.join(", ") || "None"}`);
  }, [pressedKeys, getPressedKeyNames]);

  return (
    <>
      <div className={s.container}>
        {/* <Header user={mockUser} /> */}
        <PlayField />
      </div>
      <BackgroundVideo
        src="/music/hebi - onward/background.mp4"
        style={{ filter: "blur(30px) brightness(0.4)" }}
      />
    </>
  );
}
