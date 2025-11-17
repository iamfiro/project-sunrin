import { useRef } from "react";

import s from "@/shared/styles/pages/start.module.scss";

export default function Start() {
  const containerRef = useRef<HTMLAnchorElement>(null);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (containerRef.current) {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await containerRef.current.requestFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    }

    setTimeout(() => {
      window.location.href = "/game/intro";
    }, 300);
  };

  return (
    <a
      ref={containerRef}
      href="/game/select"
      className={s.container}
      onClick={handleClick}
    >
      <span className={s.text}>Press to start</span>
    </a>
  );
}
