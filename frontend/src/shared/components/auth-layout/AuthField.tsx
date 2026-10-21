import classNames from "classnames";
import { Eye, EyeOff, LucideIcon } from "lucide-react";
import { ChangeEvent, ReactNode, useState } from "react";

import s from "@/shared/styles/pages/auth/form.module.scss";

interface Props {
  name: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  children?: ReactNode;
}

export default function AuthField({
  name,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  error,
  children,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const errorId = `${name}-error`;

  return (
    <div className={s.inputGroup}>
      <div className={classNames(s.field, { [s.fieldError]: error })}>
        <span className={s.fieldIcon}>
          <Icon size={28} aria-hidden />
        </span>
        <div className={s.fieldBody}>
          <label htmlFor={name} className={s.label}>
            {label}
          </label>
          <input
            id={name}
            name={name}
            type={isPassword && revealed ? "text" : type}
            className={s.input}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          />
        </div>
        {isPassword && (
          <button
            type="button"
            className={s.iconButton}
            onClick={() => setRevealed((prev) => !prev)}
            aria-label={revealed ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {revealed ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {children}

      {error && (
        <p id={errorId} className={s.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
