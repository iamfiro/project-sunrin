import { useEffect, useState } from "react";

import { useMusic } from "@/shared/providers";

import s from "@/shared/styles/pages/intro.module.scss";

export default function Intro() {
  const [showingContainer, setShowingContainer] = useState("logo");
  const { loadMusic } = useMusic();

  useEffect(() => {
    loadMusic("/music/Retro Waltz.mp3", true);
  }, []);

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowingContainer("credit");
    }, 3000);

    const gameCompositionTimer = setTimeout(() => {
      window.location.href = "/game/loading";
    }, 7000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(gameCompositionTimer);
    };
  }, []);

  return (
    <>
      {showingContainer === "logo" && (
        <div className={s.logoContainer}>
          <img
            src="/logo.svg"
            alt="logo"
            className={s.logo}
            width={140}
            height={140}
          />
        </div>
      )}
      {showingContainer === "credit" && (
        <div className={s.blackContainer}>
          <span>제작 / 개발</span>
          <span className={s.creditText}>조성주 박찬혁 신유준</span>
        </div>
      )}
    </>
  );
}
