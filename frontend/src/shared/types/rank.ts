import { User } from "./user";

export interface TrackRank {
  user?: User;
  username: string;
  rank: number;
  score: number;
}
