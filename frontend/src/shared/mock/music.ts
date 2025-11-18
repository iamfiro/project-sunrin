import { Track, TrackDifficultyEnum } from "../types/music";

export const mockTrack: Track[] = [
  {
    title: "지금부터",
    artist: "Hebi",
    bpm: 120,
    community: true,
    playTime: 142,
    difficulties: [
      {
        difficulty: TrackDifficultyEnum.EASY,
        unlocked: true,
        level: 5,
      },
      {
        difficulty: TrackDifficultyEnum.NORMAL,
        unlocked: false,
        level: 23,
      },
      {
        difficulty: TrackDifficultyEnum.HARD,
        unlocked: false,
        level: 72,
      },
    ],
    coverSrc: "/music/hebi - onward/cover.jpg",
    cdSrc: "/music/hebi - onward/cd.jpeg",
    backgroundVideoSrc: "/music/hebi - onward/background.mp4",
  },
  {
    title: "달토끼",
    artist: "꽃감이",
    bpm: 60,
    community: false,
    playTime: 142,
    difficulties: [
      {
        difficulty: TrackDifficultyEnum.EASY,
        unlocked: true,
        level: 5,
      },
      {
        difficulty: TrackDifficultyEnum.NORMAL,
        unlocked: false,
        level: 23,
      },
      {
        difficulty: TrackDifficultyEnum.HARD,
        unlocked: false,
        level: 72,
      },
    ],
    coverSrc: "/music/moon bunny.jpg",
    cdSrc: "/music/hebi - onward/cd.jpeg",
    backgroundVideoSrc: "/music/hebi - onward/background.mp4",
  },
];
