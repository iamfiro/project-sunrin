export interface User {
  id: string;
  name: string;
  profileImage: string;
  stats: UserStats;
}

export interface UserStats {
  perfectCount: number;
  highestScore: number;
}
