import { CSSProperties, useEffect, useRef } from "react";

import s from "./style.module.scss";

interface Props {
  src: string;
  className?: string;
  style?: CSSProperties;
  isPaused?: boolean;
  loop?: boolean;
  onEnded?: () => void;
}

export default function BackgroundVideo({ 
  src, 
  className, 
  style, 
  isPaused = false,
  loop = true,
  onEnded
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // 비디오 로드하여 첫 프레임 표시
      videoRef.current.load();
    }
  }, [src]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          console.error("Video play failed:", error);
        });
      }
    }
  }, [isPaused]);

  const handleVideoEnded = () => {
    if (onEnded) {
      onEnded();
    }
  };

  return (
    <video
      ref={videoRef}
      loop={loop}
      preload="auto"
      className={`${s.video} ${className || ""}`}
      disablePictureInPicture={true}
      style={style}
      onEnded={handleVideoEnded}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
