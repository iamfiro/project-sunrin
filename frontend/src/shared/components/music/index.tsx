import { Track } from "@/shared/types/music";

import s from "./style.module.scss";

const DEFAULT_CD_HOLE = "/images/music/CD Hole.png";

export default function MusicAlbumCover({
  title,
  artist,
  coverSrc,
  cdSrc,
}: Track) {
  return (
    <div className={s.music}>
      <div className={s.coverContainer}>
        <div className={s.cd}>
          <img src={cdSrc} alt={`${title} cd`} className={s.cdImage} />
          <img src={DEFAULT_CD_HOLE} alt="cd hole" className={s.cdHole} />
        </div>
        <img src={coverSrc} alt={`${title} cover`} className={s.cover} />
      </div>
      <div className={s.info}>
        <h1 className={s.title}>{title}</h1>
        <p className={s.artist}>{artist}</p>
      </div>
    </div>
  );
}
