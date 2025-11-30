import { useNavigate } from "react-router-dom";

import { User } from "@/shared/types/user";

import { FlexAlign, HStack } from "../stack";

import s from "./style.module.scss";

export default function Header({ user }: { user: User }) {
  const navigate = useNavigate();

  const handleEditorClick = () => {
    navigate("/game/editor");
  };

  return (
    <header className={s.header}>
      <div style={{ width: 520 }}>
        <img src="/logo_brand.svg" alt="logo_black" className={s.logo} />
      </div>
      <HStack align={FlexAlign.Center} gap={12} className={s.userInfo}>
        <span>
          {user.name} #{user.id}
        </span>
        <div>
          <img src={user.profileImage} className={s.profile} />
        </div>
      </HStack>
      <HStack fullHeight gap={32}>
        <HStack align={FlexAlign.Center} gap={12} className={s.perfect}>
          <span>퍼펙트</span>
          <div>
            <span>{user.stats.perfectCount}개</span>
          </div>
        </HStack>
        <HStack align={FlexAlign.Center} gap={12} className={s.scoreInfo}>
          <span>최고 점수</span>
          <div>
            <span>{user.stats.highestScore}점</span>
          </div>
        </HStack>
        <div className={s.editor}>
          <button onClick={handleEditorClick}>
            <p>에디터</p>
          </button>
        </div>
      </HStack>
    </header>
  );
}
