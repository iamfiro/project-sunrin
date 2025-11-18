import { useEffect, useState } from "react";

import s from "@/shared/styles/pages/intro.module.scss";

export default function Intro() {
  const [showingContainer, setShowingContainer] = useState("logo");

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowingContainer("credit");
    }, 3000);

    const creditTimer = setTimeout(() => {
      setShowingContainer("gameComposition");
    }, 5000);

    const gameCompositionTimer = setTimeout(() => {
      window.location.href = "/game/loading";
    }, 7000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(creditTimer);
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
      {showingContainer === "gameComposition" && (
        <div className={s.blackContainer}>
          <span>노래 제공</span>
          <span className={s.creditText}>황동화</span>
        </div>
      )}
    </>
  );
}
