import { Track, TrackDifficultyEnum } from "../types/music";

export const mockTrack: Track[] = [
  {
    title: "Onward",
    artist: "Hebi",
    bpm: 120,
    community: true,
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
];
