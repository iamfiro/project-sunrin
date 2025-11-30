import { useState } from "react";

import EditorCard from "@/components/edit/editor-card";

import s from "@/shared/styles/pages/game/editor.module.scss";

export default function Editor() {
  const [step, setStep] = useState<"title" | "music" | "edit">("title");

  const handleNext = () => {
    if (step === "title") {
      setStep("music");
    } else if (step === "music") {
      setStep("edit");
    }
  };

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <EditorCard title={step} onNext={handleNext} />
      </div>
    </div>
  );
}
