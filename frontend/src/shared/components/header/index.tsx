import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { me, User } from "@/shared/api/authService";

import { FlexAlign, HStack } from "../stack";

import s from "./style.module.scss";

const DEFAULT_PROFILE = "/profile.jpg";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then((userData) => {
        setUser(userData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleEditorClick = () => {
    navigate("/game/editor");
  };

  if (loading) {
    return (
      <header className={s.header}>
        <div style={{ width: 520 }}>
          <img src="/logo_brand.svg" alt="logo_black" className={s.logo} />
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className={s.header}>
        <div style={{ width: 520 }}>
          <img src="/logo_brand.svg" alt="logo_black" className={s.logo} />
        </div>
        <HStack align={FlexAlign.Center} gap={12} className={s.userInfo}>
          <span>로그인이 필요합니다</span>
        </HStack>
      </header>
    );
  }

  return (
    <header className={s.header}>
      <div style={{ width: 520 }}>
        <img src="/logo_brand.svg" alt="logo_black" className={s.logo} />
      </div>
      <HStack align={FlexAlign.Center} gap={12} className={s.userInfo}>
        <span>
          {user.nickname} #{user.id}
        </span>
        <div>
          <img src={DEFAULT_PROFILE} className={s.profile} alt="profile" />
        </div>
      </HStack>
      <HStack fullHeight gap={32}>
        <HStack align={FlexAlign.Center} gap={12} className={s.perfect}>
          <span>퍼펙트</span>
          <div>
            <span>{user.stats.perfectCount.toLocaleString()}개</span>
          </div>
        </HStack>
        <HStack align={FlexAlign.Center} gap={12} className={s.scoreInfo}>
          <span>최고 점수</span>
          <div>
            <span>{user.stats.highestScore.toLocaleString()}점</span>
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
