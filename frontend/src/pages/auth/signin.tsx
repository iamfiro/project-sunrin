import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/shared/providers";

import s from "@/shared/styles/pages/auth/signin.module.scss";

export default function SignIn() {
  const navigate = useNavigate();
  const { signin } = useAuth();
  const [formData, setFormData] = useState({
    nickname: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    nickname: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      nickname: "",
      password: "",
    };

    // Email validation
    if (!formData.nickname) {
      newErrors.nickname = "닉네임을 입력해주세요";
      isValid = false;
    } else if (!/.{2,}/.test(formData.nickname)) {
      newErrors.nickname = "올바른 닉네임 형식이 아닙니다";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다";
      isValid = false;
    }

    setErrors(newErrors as any);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signin({
        nickname: formData.nickname,
        password: formData.password,
      });
      navigate("/game/select");
    } catch (error) {
      console.error("로그인 실패:", error);
      setErrors((prev) => ({
        ...prev,
        password: "로그인에 실패했습니다. 다시 시도해주세요.",
      }));
    }
  };

  return (
    <div className={s.container}>
      <div className={s.formWrapper}>
        <div className={s.formLogo}>
          <img src="/logo.svg" alt="logo" />
        </div>

        <form className={s.form} onSubmit={handleSubmit}>
          <div className={s.inputGroup}>
            <label htmlFor="nickname" className={s.label}>
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              className={s.input}
              placeholder="NICKNAME"
              value={formData.nickname}
              onChange={handleChange}
              autoComplete="nickname"
            />
            {errors.nickname && <p className={s.error}>{errors.nickname}</p>}
          </div>

          <div className={s.inputGroup}>
            <label htmlFor="password" className={s.label}>
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={s.input}
              placeholder="PASSWORD"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className={s.error}>{errors.password}</span>
            )}
          </div>

          <button type="submit" className={s.submitButton}>
            로그인
          </button>
        </form>

        <div className={s.footer}>
          <p className={s.footerText}>
            계정이 없으신가요?{" "}
            <a href="/auth/signup" className={s.link}>
              회원가입
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
