// 비밀번호 강도를 리듬게임 랭크로 표시한다 (미터 칸 수 = level)
export const PASSWORD_RANKS = [
  { grade: "F", level: 1, color: "#ff0000" },
  { grade: "C", level: 2, color: "#919191" },
  { grade: "B", level: 3, color: "#30baff" },
  { grade: "A", level: 4, color: "#57d000" },
  { grade: "S", level: 5, color: "#7a00b3" },
] as const;

export type PasswordRank = (typeof PASSWORD_RANKS)[number];

/**
 * 입력된 비밀번호에 맞는 랭크를 돌려준다. 빈 문자열이면 null (미터 숨김).
 * 서버/폼 검증 최소 조건: 6자 이상.
 */
export function getPasswordRank(password: string): PasswordRank | null {
  if (!password) return null;

  // TODO(human): password를 평가해 PASSWORD_RANKS 중 하나를 반환
  return PASSWORD_RANKS[0];
}
