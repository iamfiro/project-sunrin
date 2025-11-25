import { X } from "lucide-react";
import {
  type MouseEventHandler,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import styles from "./styles.module.scss";

type ModalSize = "sm" | "md" | "lg" | "full";

export type ModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  lockScroll?: boolean;
  className?: string;
  contentClassName?: string;
  portalTarget?: HTMLElement | null;
  children: ReactNode;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const sizeClassName: Record<ModalSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  full: styles.sizeFull,
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  footer,
  size = "md",
  closeOnOverlay = true,
  closeOnEsc = true,
  showCloseButton = true,
  lockScroll = true,
  className,
  contentClassName,
  portalTarget,
  children,
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!closeOnEsc || !isOpen) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [closeOnEsc, isOpen, onClose]);

  useEffect(() => {
    if (!lockScroll || typeof document === "undefined" || !isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, lockScroll]);

  const target = useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }
    return portalTarget ?? document.body;
  }, [portalTarget]);

  if (!isMounted || !isOpen || !target) {
    return null;
  }

  const handleOverlayMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target !== overlayRef.current) {
      return;
    }

    if (closeOnOverlay) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="presentation"
      onMouseDown={handleOverlayMouseDown}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cx(styles.container, sizeClassName[size], className)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {showCloseButton && onClose ? (
          <button
            type="button"
            className={styles.closeButton}
            aria-label="모달 닫기"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        ) : null}

        {(title || description) && (
          <header className={styles.header}>
            {title ? (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </header>
        )}

        <div className={cx(styles.content, contentClassName)}>{children}</div>

        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </section>
    </div>,
    target,
  );
}
