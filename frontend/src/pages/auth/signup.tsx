import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signup as signupService } from "@/shared/api/authService";

import s from "@/shared/styles/pages/auth/signup.module.scss";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirm: "",
    nickname: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    password_confirm: "",
    nickname: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      email: "",
      password: "",
      password2: "",
      nickname: "",
    };

    // Nickname validation
    if (!formData.nickname) {
      newErrors.nickname = "닉네임을 입력해주세요";
      isValid = false;
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = "닉네임은 최소 2자 이상이어야 합니다";
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
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

    // Confirm password validation
    if (!formData.password_confirm) {
      newErrors.password_confirm = "비밀번호 확인을 입력해주세요";
      isValid = false;
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = "비밀번호가 일치하지 않습니다";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { password2, ...signupData } = formData;
      const response = await signupService(signupData);

      if (response.message) {
        // Redirect to login page with success message
        navigate("/auth/signin", {
          state: {
            success: true,
            message: "회원가입이 완료되었습니다. 로그인해주세요.",
          },
        });
      }
    } catch (error: any) {
      console.error("회원가입 실패:", error);

      // Handle different error cases
      if (error.response?.data) {
        const errorData = error.response.data;
        const newErrors = { ...errors };

        if (errorData.email) {
          newErrors.email = Array.isArray(errorData.email)
            ? errorData.email[0]
            : errorData.email;
        }

        if (errorData.nickname) {
          newErrors.nickname = Array.isArray(errorData.nickname)
            ? errorData.nickname[0]
            : errorData.nickname;
        }

        if (errorData.password) {
          newErrors.password = Array.isArray(errorData.password)
            ? errorData.password[0]
            : errorData.password;
        }

        setErrors(newErrors);
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
        }));
      }
    } finally {
      setIsSubmitting(false);
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
              placeholder="닉네임을 입력하세요"
              value={formData.nickname}
              onChange={handleChange}
              autoComplete="nickname"
            />
            {errors.nickname && (
              <span className={s.error}>{errors.nickname}</span>
            )}
          </div>

          <div className={s.inputGroup}>
            <label htmlFor="email" className={s.label}>
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={s.input}
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className={s.error}>{errors.email}</span>}
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
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && (
              <span className={s.error}>{errors.password}</span>
            )}
          </div>

          <div className={s.inputGroup}>
            <label htmlFor="confirmPassword" className={s.label}>
              비밀번호 확인
            </label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              className={s.input}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.password_confirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password_confirm && (
              <span className={s.error}>{errors.password_confirm}</span>
            )}
          </div>

          <button
            type="submit"
            className={s.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "회원가입"}
          </button>
        </form>

        <div className={s.footer}>
          <p className={s.footerText}>
            이미 계정이 있으신가요?{" "}
            <a href="/auth/signin" className={s.link}>
              로그인
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
