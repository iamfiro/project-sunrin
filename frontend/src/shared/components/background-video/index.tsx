import s from "./style.module.scss";

interface BackgroundVideoProps {
  src: string;
  className?: string;
}

export default function BackgroundVideo({
  src,
  className,
}: BackgroundVideoProps) {
  return (
    <video
      autoPlay
      loop
      className={`${s.video} ${className || ""}`}
      disablePictureInPicture={true}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
