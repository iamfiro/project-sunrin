import { useEffect, useState } from "react";

import { useMusic } from "@/shared/providers";

import s from "@/shared/styles/pages/loading.module.scss";

export default function Loading() {
  const [dots, setDots] = useState(".");
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
    const timer = setTimeout(() => {
      window.location.href = "/game/select";
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={s.container}>
      <img src="/logo.svg" alt="logo" className={s.logo} />
      <span className={s.text}>게임을 초기화 하는 중{dots}</span>
    </div>
  );
}
