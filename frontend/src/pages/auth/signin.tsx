import { CheckCircle2, ChevronRight, Lock, User } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthField, AuthLayout } from "@/shared/components";
import { useAuth } from "@/shared/providers";

import s from "@/shared/styles/pages/auth/form.module.scss";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signin } = useAuth();
  const notice = (location.state as { message?: string } | null)?.message;

  const [formData, setFormData] = useState({
    nickname: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    nickname: "",
    password: "",
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
      nickname: "",
      password: "",
    };

    if (!formData.nickname) {
      newErrors.nickname = "닉네임을 입력해주세요";
      isValid = false;
    } else if (!/.{2,}/.test(formData.nickname)) {
      newErrors.nickname = "올바른 닉네임 형식이 아닙니다";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다";
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="로그인"
      description="닉네임으로 로그인하고 기록을 이어가세요"
      hints={[
        { icon: "tab", label: "Next" },
        { icon: "enter", label: "Login" },
      ]}
    >
      <form className={s.form} onSubmit={handleSubmit} noValidate>
        {notice && (
          <p className={s.notice}>
            <CheckCircle2 size={20} aria-hidden />
            {notice}
          </p>
        )}

        <AuthField
          name="nickname"
          label="닉네임"
          icon={User}
          placeholder="닉네임을 입력하세요"
          value={formData.nickname}
          onChange={handleChange}
          autoComplete="nickname"
          error={errors.nickname}
        />

        <AuthField
          name="password"
          type="password"
          label="비밀번호"
          icon={Lock}
          placeholder="비밀번호를 입력하세요"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          error={errors.password}
        />

        <button
          type="submit"
          className={s.submitButton}
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? "로그인 중..." : "로그인"}</span>
          <ChevronRight size={28} aria-hidden />
        </button>
      </form>
    </AuthLayout>
  );
}
