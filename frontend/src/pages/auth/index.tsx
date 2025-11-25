import { Link } from "react-router-dom";

import s from "@/shared/styles/pages/auth/auth.module.scss";

export default function Auth() {
  return (
    <div className={s.container}>
      <div className={s.formWrapper}>
        <div className={s.formLogo}>
          <img src="/logo.svg" alt="logo" />
        </div>

        <div className={s.buttonGroup}>
          <Link to="/auth/signin" className={s.button}>
            로그인
          </Link>
          <Link to="/auth/signup" className={s.button}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
