import { TrackCover } from "@/components/music";
import { Header } from "@/shared/components";
import { FlexAlign, HStack } from "@/shared/components/stack";
import { mockUser } from "@/shared/mock/user";

import s from "@/shared/styles/pages/game/select.module.scss";

export default function SongSelect() {
  return (
    <div className={s.container}>
      <video autoPlay loop className={s.video} disablePictureInPicture={true}>
        <source src="/music/hebi - onward/background.mp4" type="video/mp4" />
      </video>
      <main className={s.main}>
        <Header user={mockUser} />
        <div className={s.content}>
          <div className={s.left}>
            <TrackCover
              title="Onward"
              artist="Hebi"
              coverSrc="/music/hebi - onward/cover.jpg"
              cdSrc="/music/hebi - onward/cd.jpeg"
            />
          </div>
          <div className={s.right}>a</div>
        </div>
        <footer className={s.footer}>
          <HStack align={FlexAlign.Center} gap={8}>
            <img
              src="/images/keyboard/keyboard_updown.svg"
              alt="updown"
              height={22}
            />
            <span>Change Music</span>
          </HStack>
        </footer>
      </main>
    </div>
  );
}
