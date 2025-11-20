import s from "./style.module.scss";

interface JudgementProps {
  judgement: string | null;
}

export default function Judgement({ judgement }: JudgementProps) {
  if (!judgement) return null;

  return <div className={s.judgement}>{judgement}</div>;
}
