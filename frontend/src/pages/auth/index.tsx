import { LogIn, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthLayout } from "@/shared/components";
import useKeyNavigationShortcuts from "@/shared/hook/useKeyNavigationShortcuts";

import s from "@/shared/styles/pages/auth/form.module.scss";

const MODES = [
  {
    to: "/auth/signin",
    icon: LogIn,
    title: "로그인",
    description: "이미 계정이 있다면 기록을 이어서 플레이",
  },
  {
    to: "/auth/signup",
    icon: UserPlus,
    title: "회원가입",
    description: "새 플레이어로 등록하고 첫 곡을 시작",
  },
];

export default function Auth() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);

  // 곡 선택 화면과 같은 W/S(↑/↓) + Enter 조작
  const next = useCallback(
    () => setSelected((prev) => (prev + 1) % MODES.length),
    [],
  );
  const prev = useCallback(
    () => setSelected((prev) => (prev - 1 + MODES.length) % MODES.length),
    [],
  );

  useKeyNavigationShortcuts({
    onNext: next,
    onPrev: prev,
    nextKeyCodes: ["KeyS", "ArrowDown"],
    prevKeyCodes: ["KeyW", "ArrowUp"],
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Enter" && !e.repeat) {
        e.preventDefault();
        navigate(MODES[selected].to);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, selected]);

  return (
    <AuthLayout
      title="시작하기"
      description="플레이 방법을 선택하세요"
      showTabs={false}
      hints={[
        { icon: "updown", label: "Change" },
        { icon: "enter", label: "Select" },
      ]}
    >
      <nav className={s.modeList}>
        {MODES.map(({ to, icon: Icon, title, description }, idx) => (
          <Link
            key={to}
            to={to}
            className={`${s.modeCard} ${idx === selected ? s.selected : ""}`}
            onMouseEnter={() => setSelected(idx)}
          >
            <span className={s.modeIcon}>
              <Icon size={36} aria-hidden />
            </span>
            <span className={s.modeText}>
              <strong className={s.modeTitle}>{title}</strong>
              <span className={s.modeDescription}>{description}</span>
            </span>
          </Link>
        ))}
      </nav>
    </AuthLayout>
  );
}
