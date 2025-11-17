import { useEffect, useState } from "react";

import { useMusic } from "@/shared/providers";

import s from "./style.module.scss";

export default function SuspendFallback() {
  const [dots, setDots] = useState(".");
  const [showingContainer, setShowingContainer] = useState("logo");
  const { loadMusic } = useMusic();

  useEffect(() => {
    loadMusic("/music/Retro Waltz.mp3", true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "") return ".";
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return "";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowingContainer("credit");
    }, 3000);

    const creditTimer = setTimeout(() => {
      setShowingContainer("gameComposition");
    }, 5000);

    const gameCompositionTimer = setTimeout(() => {
      setShowingContainer("end");
    }, 7000);

    const endTimer = setTimeout(() => {
      window.location.href = "/game/select";
    }, 11000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(creditTimer);
      clearTimeout(gameCompositionTimer);
      clearTimeout(endTimer);
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
      <div className={s.container}>
        <img src="/logo.svg" alt="logo" className={s.logo} />
        <span className={s.text}>게임을 초기화 하는 중{dots}</span>
      </div>
    </>
  );
}
