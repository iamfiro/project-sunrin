import { ChevronFirst, ChevronLast, Pause, Play, X } from "lucide-react";
import MusicTempo from "music-tempo";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

import { Chart } from "@/shared/types/game/chart";
import { useEditorStore } from "@/store/useEditorStore";

import LineSection from "../line-section";

import s from "./style.module.scss";

interface Props {
  title: "title" | "music" | "edit";
  onNext: () => void;
}
export default function EditorCard({ title, onNext }: Props) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalSections, setTotalSections] = useState(16); // Add state for total sections

  const dummyChart: Chart = {
    id: "chart_001",
    title: "Test Song",
    artist: "Test Artist",
    difficulty: 5,
    notes: [
      {
        id: "n1",
        time: 1000, // 1초
        lane: 1,
        type: "tap",
      },
      {
        id: "n2",
        time: 1500,
        lane: 2,
        type: "tap",
      },
      {
        id: "n3",
        time: 2000,
        lane: 3,
        type: "hold",
        duration: 800, // 0.8초
      },
      {
        id: "n4",
        time: 3000,
        lane: 1,
        type: "tap",
      },
      {
        id: "n5",
        time: 3500,
        lane: 2,
        type: "tap",
      },
      {
        id: "n6",
        time: 4000,
        lane: 4,
        type: "hold",
        duration: 1200,
      },
    ],
  };

  const { editTitle, setEditTitle, editMusic, setEditMusic, bpm, setBpm } =
    useEditorStore();

  useEffect(() => {
    if (title === "edit" && editMusic && waveformRef.current) {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#fdfdfe",
        progressColor: "#b0b0b0",
        height: 80,
        dragToSeek: true,
      });
      wavesurferRef.current.loadBlob(editMusic);

      wavesurferRef.current.on("play", () => setIsPlaying(true));
      wavesurferRef.current.on("pause", () => setIsPlaying(false));
      wavesurferRef.current.on("finish", () => setIsPlaying(false));
      wavesurferRef.current.on("ready", () => {
        if (wavesurferRef.current) {
          // Set total sections based on music duration
          const duration = wavesurferRef.current.getDuration();
          const sections = Math.ceil(duration / 0.5);
          setTotalSections(sections > 0 ? sections : 16); // Fallback to 16 if calculation fails

          // BPM calculation
          const audioBuffer = wavesurferRef.current.getDecodedData();
          if (audioBuffer) {
            const audioData = audioBuffer.getChannelData(0);
            const musicTempo = new MusicTempo(audioData);
            setBpm(Math.round(musicTempo.tempo));
          }
        }
      });

      const handleTimeUpdate = (currentTime: number) => {
        if (editorRef.current) {
          const pixelsPerSecond = 400 / 0.5; // 400px per 500ms section
          editorRef.current.scrollLeft = currentTime * pixelsPerSecond;
        }
      };

      wavesurferRef.current.on("timeupdate", handleTimeUpdate);
      wavesurferRef.current.on("seek", (progress) => {
        if (wavesurferRef.current) {
          const currentTime = wavesurferRef.current.getDuration() * progress;
          handleTimeUpdate(currentTime);
        }
      });
    }
  }, [title, editMusic, setBpm]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (seconds: number) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.skip(seconds);
    }
  };

  const onTitleSave = (text: string) => {
    setEditTitle(text);
  };

  const onMusicSave = (file: File) => {
    setEditMusic(file);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // If music is playing, the scroll is driven by timeupdate. Ignore user scroll to prevent a feedback loop.
    if (isPlaying || !wavesurferRef.current) {
      return;
    }

    // The rest of the logic handles manual scrubbing when the music is paused.
    const currentScroll = e.currentTarget.scrollLeft;
    const pixelsPerSecond = 800; // 400px per 0.5s
    const expectedScroll =
      wavesurferRef.current.getCurrentTime() * pixelsPerSecond;

    // If the scroll difference is small, assume it's a residual programmatic scroll and ignore
    if (Math.abs(currentScroll - expectedScroll) < 5) {
      return;
    }

    // Otherwise, it's a user scroll, so seek the audio
    const newTime = currentScroll / pixelsPerSecond;
    const duration = wavesurferRef.current.getDuration();
    if (duration > 0) {
      wavesurferRef.current.seekTo(newTime / duration);
    }
  };

  useEffect(() => {
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, []);
  if (title === "title") {
    return (
      <div className={s.contents}>
        <div className={s.header}>
          <div className={s.spacer}></div>
          <h2>에디터 시작하기</h2>
          <X scale={24} color="#8E8E8E" />
        </div>
        <div className={s.body}>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            onChange={(e) => onTitleSave(e.target.value)}
          />
          <button onClick={onNext}>다음으로</button>
        </div>
      </div>
    );
  } else if (title === "music") {
    return (
      <div className={s.contents}>
        <div className={s.header}>
          <div className={s.spacer}></div>
          <h2>음악 선택하기</h2>
          <X scale={24} color="#8E8E8E" />
        </div>
        <div className={s.body}>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onMusicSave(file);
              }
            }}
          />
          <button onClick={onNext}>다음으로</button>
        </div>
      </div>
    );
  } else if (title === "edit") {
    return (
      <div className={s.contents}>
        <div className={s.topBar}>
          <img src="/logo_brand.svg" alt="logo" />
        </div>
        <div className={s.editContainer}>
          <div className={s.editor} ref={editorRef} onScroll={handleScroll}>
            {Array.from({ length: totalSections }, (_, i) => {
              const msPerMeasure = 500;
              const startTime = i * msPerMeasure;
              const endTime = (i + 1) * msPerMeasure;
              const notesForSection = dummyChart.notes.filter(
                (note) => note.time >= startTime && note.time < endTime,
              );
              return (
                <LineSection
                  key={i}
                  notes={notesForSection}
                  measureStartTime={startTime}
                  measureDuration={msPerMeasure}
                />
              );
            })}
          </div>
        </div>
        <div className={s.musicInfo}>
          <input
            className={s.bpm}
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
          />
          <div className={s.control}>
            <button onClick={() => handleSeek(-5)}>
              <ChevronFirst scale={24} />
            </button>
            <button className={s.startButton} onClick={handlePlayPause}>
              {isPlaying ? <Pause scale={24} /> : <Play scale={24} />}
            </button>
            <button onClick={() => handleSeek(5)}>
              <ChevronLast scale={24} />
            </button>
          </div>
          <p className={s.musicTitle}>{editTitle}</p>
        </div>
        <div className={s.noteContainer}></div>
        <div className={s.waveform} ref={waveformRef}></div>
      </div>
    );
  }
}
