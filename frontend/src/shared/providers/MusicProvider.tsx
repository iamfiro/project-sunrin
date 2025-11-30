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
  currentSrc: string | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  loadMusic: (src: string, autoPlay?: boolean) => void;
  stopMusic: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
  defaultSrc?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

// 모듈 레벨 싱글톤 오디오 객체 (페이지 이동해도 유지)
let globalAudio: HTMLAudioElement | null = null;
let globalCurrentSrc: string | null = null;

const getGlobalAudio = (loop: boolean = true): HTMLAudioElement => {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.loop = loop;
  }
  return globalAudio;
};

export function MusicProvider({
  children,
  defaultSrc,
  autoPlay = false,
  loop = true,
}: MusicProviderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSrc, setCurrentSrc] = useState<string | null>(globalCurrentSrc);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const audio = getGlobalAudio(loop);

    // 이벤트 핸들러
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    // 초기 상태 동기화 (이미 재생 중인 경우)
    if (audio.src) {
      setIsPlaying(!audio.paused);
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
      setCurrentSrc(globalCurrentSrc);
    }

    // 최초 한 번만 defaultSrc 로드
    if (!isInitializedRef.current && defaultSrc && !globalCurrentSrc) {
      isInitializedRef.current = true;
      const baseUrl = import.meta.env.BASE_URL || "/";
      const fullSrc =
        baseUrl +
        (defaultSrc.startsWith("/") ? defaultSrc.slice(1) : defaultSrc);
      audio.src = fullSrc;
      globalCurrentSrc = fullSrc;
      setCurrentSrc(fullSrc);

      if (autoPlay) {
        audio.play().catch((err) => {
          console.error("Auto play failed:", err);
        });
      }
    }

    return () => {
      // cleanup에서 오디오를 중지하지 않음 (페이지 이동 시 유지)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [loop, defaultSrc, autoPlay]);

  useEffect(() => {
    const audio = getGlobalAudio(loop);
    audio.loop = loop;
  }, [loop]);

  useEffect(() => {
    const audio = getGlobalAudio(loop);
    audio.volume = volume;
  }, [volume, loop]);

  const play = () => {
    const audio = getGlobalAudio(loop);
    audio.play().catch((err) => {
      console.error("Play failed:", err);
      setIsPlaying(false);
    });
  };

  const pause = () => {
    const audio = getGlobalAudio(loop);
    audio.pause();
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
    const audio = getGlobalAudio(loop);
    audio.volume = clampedVolume;
  };

  const seek = (time: number) => {
    const audio = getGlobalAudio(loop);
    audio.currentTime = time;
  };

  const loadMusic = (src: string, autoPlay: boolean = false) => {
    const audio = getGlobalAudio(loop);

    // 같은 음악이면 로드하지 않음
    const baseUrl = import.meta.env.BASE_URL || "/";
    const fullSrc = baseUrl + (src.startsWith("/") ? src.slice(1) : src);

    if (globalCurrentSrc === fullSrc) {
      if (autoPlay && audio.paused) {
        audio.play().catch((err) => console.error("Play failed:", err));
      }
      return;
    }

    const wasPlaying = !audio.paused || autoPlay;

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
      });

      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    audio.src = fullSrc;
    globalCurrentSrc = fullSrc;
    setCurrentSrc(fullSrc);
    audio.load();
  };

  const stopMusic = () => {
    const audio = getGlobalAudio(loop);
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const value: MusicContextType = {
    isPlaying,
    volume,
    currentTime,
    duration,
    currentSrc,
    play,
    pause,
    toggle,
    setVolume,
    seek,
    loadMusic,
    stopMusic,
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
