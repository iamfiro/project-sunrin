import { ChevronRight, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { CSSProperties, useState } from "react";
import { useNavigate } from "react-router-dom";

import { signup as signupService } from "@/shared/api/authService";
import { AuthField, AuthLayout } from "@/shared/components";

import { getPasswordRank, PASSWORD_RANKS } from "./passwordRank";

import s from "@/shared/styles/pages/auth/form.module.scss";

const EMPTY_FORM = {
  email: "",
  password: "",
  password_confirm: "",
  nickname: "",
};

type FormFields = typeof EMPTY_FORM;

const pickMessage = (value: unknown) =>
  Array.isArray(value) ? String(value[0]) : String(value);

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormFields>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormFields>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rank = getPasswordRank(formData.password);

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
    const newErrors = { ...EMPTY_FORM };

    if (!formData.nickname) {
      newErrors.nickname = "닉네임을 입력해주세요";
      isValid = false;
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = "닉네임은 최소 2자 이상이어야 합니다";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다";
      isValid = false;
    }

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
      const response = await signupService(formData);

      if (response.message) {
        // Redirect to login page with success message
        navigate("/auth/signin", {
          state: {
            success: true,
            message: "회원가입이 완료되었습니다. 로그인해주세요.",
          },
        });
      }
    } catch (error) {
      console.error("회원가입 실패:", error);

      // Handle different error cases
      const errorData = (
        error as { response?: { data?: Record<string, unknown> } }
      ).response?.data;
      if (errorData) {
        // 서버가 돌려준 필드별 메시지만 덮어쓴다
        const serverErrors: Partial<FormFields> = {};
        (["email", "nickname", "password"] as const).forEach((field) => {
          if (errorData[field]) {
            serverErrors[field] = pickMessage(errorData[field]);
          }
        });
        setErrors((prev) => ({ ...prev, ...serverErrors }));
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

  const passwordsMatch =
    !!formData.password_confirm &&
    formData.password === formData.password_confirm;

  return (
    <AuthLayout
      title="회원가입"
      description="새 플레이어로 등록하고 첫 곡을 시작하세요"
      hints={[
        { icon: "tab", label: "Next" },
        { icon: "enter", label: "Sign Up" },
      ]}
    >
      <form className={s.form} onSubmit={handleSubmit} noValidate>
        <AuthField
          name="nickname"
          label="닉네임"
          icon={User}
          placeholder="2자 이상"
          value={formData.nickname}
          onChange={handleChange}
          autoComplete="nickname"
          error={errors.nickname}
        />

        <AuthField
          name="email"
          type="email"
          label="이메일"
          icon={Mail}
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          error={errors.email}
        />

        <AuthField
          name="password"
          type="password"
          label="비밀번호"
          icon={Lock}
          placeholder="6자 이상"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          error={errors.password}
        >
          {rank && (
            <div className={s.rankMeter} aria-live="polite">
              <div className={s.rankBars}>
                {PASSWORD_RANKS.map(({ level }) => (
                  <span
                    key={level}
                    style={
                      level <= rank.level
                        ? ({ background: rank.color } as CSSProperties)
                        : undefined
                    }
                  />
                ))}
              </div>
              <span
                className={s.rankLabel}
                style={{ backgroundColor: rank.color }}
              >
                RANK {rank.grade}
              </span>
            </div>
          )}
        </AuthField>

        <AuthField
          name="password_confirm"
          type="password"
          label="비밀번호 확인"
          icon={ShieldCheck}
          placeholder="비밀번호를 다시 입력하세요"
          value={formData.password_confirm}
          onChange={handleChange}
          autoComplete="new-password"
          error={errors.password_confirm}
        >
          {passwordsMatch && <p className={s.success}>비밀번호가 일치합니다</p>}
        </AuthField>

        <button
          type="submit"
          className={s.submitButton}
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? "가입 중..." : "회원가입"}</span>
          <ChevronRight size={28} aria-hidden />
        </button>
      </form>
    </AuthLayout>
  );
}
