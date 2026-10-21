import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { FlexAlign, HStack } from "../stack";

import s from "./style.module.scss";

const TABS = [
  { to: "/auth/signin", label: "로그인" },
  { to: "/auth/signup", label: "회원가입" },
];

export interface KeyHint {
  icon: "enter" | "tab" | "updown";
  label: string;
}

interface Props {
  title: string;
  description: string;
  hints: KeyHint[];
  showTabs?: boolean;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  description,
  hints,
  showTabs = true,
  children,
}: Props) {
  const { pathname } = useLocation();

  return (
    <div className={s.container}>
      <div className={s.background} aria-hidden />

      <main className={s.main}>
        <div className={s.content}>
          <section className={s.left}>
            <img src="/logo.svg" alt="PRJ:SUNRIN" className={s.logo} />
            <div className={s.info}>
              <h1 className={s.title}>{title}</h1>
              <p className={s.description}>{description}</p>
            </div>
          </section>

          <section className={s.right}>
            {showTabs && (
              <HStack align={FlexAlign.Center} gap={12} className={s.tabs}>
                {TABS.map((tab) => (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={pathname === tab.to ? s.tabActive : s.tab}
                  >
                    {tab.label}
                  </Link>
                ))}
              </HStack>
            )}
            {children}
          </section>
        </div>

        <footer className={s.footer}>
          <HStack align={FlexAlign.Center} gap={24}>
            {hints.map((hint) => (
              <HStack key={hint.label} align={FlexAlign.Center} gap={8}>
                <img
                  src={`/images/keyboard/keyboard_${hint.icon}.svg`}
                  alt={hint.icon}
                  height={22}
                />
                <span>{hint.label}</span>
              </HStack>
            ))}
          </HStack>
        </footer>
      </main>
    </div>
  );
}
