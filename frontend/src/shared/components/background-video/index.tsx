import { CSSProperties } from "react";

import s from "./style.module.scss";

interface Props {
  src: string;
  className?: string;
  style?: CSSProperties;
}

export default function BackgroundVideo({ src, className, style }: Props) {
  return (
    <video
      autoPlay
      loop
      className={`${s.video} ${className || ""}`}
      disablePictureInPicture={true}
      style={style}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
