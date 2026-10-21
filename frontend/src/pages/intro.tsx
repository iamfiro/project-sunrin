import { useEffect } from "react";

import { useMusic } from "@/shared/providers";

import s from "@/shared/styles/pages/intro.module.scss";

export default function Intro() {
  const { loadMusic } = useMusic();

  useEffect(() => {
    loadMusic("/music/Retro Waltz.mp3", true);
  }, []);

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      window.location.href = "/auth";
    }, 3000);

    return () => clearTimeout(logoTimer);
  }, []);

  return (
    <div className={s.logoContainer}>
      <img
        src="/logo.svg"
        alt="logo"
        className={s.logo}
        width={140}
        height={140}
      />
    </div>
  );
}
