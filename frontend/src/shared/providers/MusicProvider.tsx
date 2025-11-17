import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  loadMusic: (src: string, autoPlay?: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
  defaultSrc?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export function MusicProvider({
  children,
  defaultSrc,
  autoPlay = false,
  loop = true,
}: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const initializeAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = loop;
      audioRef.current.volume = volume;

      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });

      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
      });

      audioRef.current.addEventListener("play", () => {
        setIsPlaying(true);
      });

      audioRef.current.addEventListener("pause", () => {
        setIsPlaying(false);
      });

      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        setIsPlaying(false);
      });
    }
    return audioRef.current;
  };

  useEffect(() => {
    initializeAudio();

    if (defaultSrc && audioRef.current) {
      audioRef.current.src = defaultSrc;
      if (autoPlay) {
        audioRef.current.play().catch((err) => {
          console.error("Auto play failed:", err);
        });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("loadedmetadata", () => {});
        audioRef.current.removeEventListener("timeupdate", () => {});
        audioRef.current.removeEventListener("ended", () => {});
        audioRef.current.removeEventListener("play", () => {});
        audioRef.current.removeEventListener("pause", () => {});
        audioRef.current.removeEventListener("error", () => {});
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
    }
  }, [loop]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = () => {
    const audio = initializeAudio();
    if (audio) {
      audio.play().catch((err) => {
        console.error("Play failed:", err);
        setIsPlaying(false);
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    const audio = initializeAudio();
    if (audio) {
      audio.volume = clampedVolume;
    }
  };

  const seek = (time: number) => {
    const audio = initializeAudio();
    if (audio) {
      audio.currentTime = time;
    }
  };

  const loadMusic = (src: string, autoPlay: boolean = false) => {
    const audio = initializeAudio();
    if (!audio) return;

    const wasPlaying = isPlaying || autoPlay;

    // 파일 로드 완료 후 재생
    const handleCanPlay = () => {
      if (wasPlaying) {
        audio.play().catch((err) => {
          console.error("Play after load failed:", err);
          setIsPlaying(false);
        });
      }
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };

    // 에러 핸들링
    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      const error = audioElement.error;
      let errorMessage = "Unknown error";

      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = "The user aborted the loading process.";
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMessage = "A network error occurred while loading the media.";
            break;
          case error.MEDIA_ERR_DECODE:
            errorMessage = "An error occurred while decoding the media.";
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "The media source is not supported.";
            break;
        }
      }

      console.error("Failed to load music:", {
        src,
        encodedSrc: audio.src,
        error: errorMessage,
        errorCode: error?.code,
        networkState: audioElement.networkState,
        readyState: audioElement.readyState,
      });

      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    // BASE_URL 추가
    const baseUrl = import.meta.env.BASE_URL || "/";
    const fullSrc = baseUrl + (src.startsWith("/") ? src.slice(1) : src);

    audio.src = fullSrc;
    audio.load();
  };

  const value: MusicContextType = {
    isPlaying,
    volume,
    currentTime,
    duration,
    play,
    pause,
    toggle,
    setVolume,
    seek,
    loadMusic,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
