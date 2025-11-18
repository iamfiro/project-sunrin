import { useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "@/shared/styles/pages/auth/signup.module.scss";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
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
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    };

    // Username validation
    if (!formData.username) {
      newErrors.username = "사용자 이름을 입력해주세요";
      isValid = false;
    } else if (formData.username.length < 2) {
      newErrors.username = "사용자 이름은 최소 2자 이상이어야 합니다";
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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
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

    try {
      // TODO: API 연동
      console.log("회원가입 시도:", {
        email: formData.email,
        password: formData.password,
        username: formData.username,
      });

      // 임시: 회원가입 성공 후 로그인 페이지로 이동
      navigate("/auth/signin");
    } catch (error) {
      console.error("회원가입 실패:", error);
      setErrors((prev) => ({
        ...prev,
        email: "회원가입에 실패했습니다. 다시 시도해주세요.",
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
            <label htmlFor="username" className={s.label}>
              사용자 이름
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={s.input}
              placeholder="홍길동"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
            />
            {errors.username && (
              <span className={s.error}>{errors.username}</span>
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
              placeholder="example@sunrin.hs.kr"
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
              id="confirmPassword"
              name="confirmPassword"
              className={s.input}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className={s.error}>{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className={s.submitButton}>
            회원가입
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
