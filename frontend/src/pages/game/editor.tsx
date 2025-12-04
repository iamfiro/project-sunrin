import { useState } from "react";

import EditorCard from "@/components/edit/editor-card";
import { useEditorStore } from "@/store/useEditorStore";

import s from "@/shared/styles/pages/game/editor.module.scss";

export default function Editor() {
  const [step, setStep] = useState<"title" | "music" | "edit">("title");
  const { editVideoUrl } = useEditorStore();

  const handleNext = () => {
    if (step === "title") {
      setStep("music");
    } else if (step === "music") {
      setStep("edit");
    }
  };

  const showVideoBackground = step !== "edit" && editVideoUrl;

  return (
    <div className={s.container}>
      {/* 배경 비디오 (title, music 단계에서만) */}
      {showVideoBackground && (
        <video
          className={s.backgroundVideo}
          src={editVideoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      {/* 배경 오버레이 */}
      <div
        className={`${s.overlay} ${showVideoBackground ? s.videoOverlay : ""}`}
      />

      <div className={s.wrapper}>
        <EditorCard title={step} onNext={handleNext} />
      </div>
    </div>
  );
}
