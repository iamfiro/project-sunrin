import { SuspendFallback } from "@/shared/components";

import s from "@/shared/styles/pages/home.module.scss";

export default function Intro() {
  return (
    <div className={s.container}>
      <SuspendFallback />
    </div>
  );
}
