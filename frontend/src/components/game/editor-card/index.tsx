import { ChevronFirst, ChevronLast, Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

import { useEditorStore } from "@/store/useEditorStore";

import s from "./style.module.scss";

interface Props {
  title: "title" | "music" | "edit";
  onNext: () => void;
}
export default function EditorCard({ title, onNext }: Props) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { setEditTitle, editMusic, setEditMusic } = useEditorStore();

  useEffect(() => {
    if (title === "edit" && editMusic && waveformRef.current) {
      // 기존 wavesurfer 파괴
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      // 새 wavesurfer 생성
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#fdfdfe",
        progressColor: "#b0b0b0",
        height: 80,
      });
      wavesurferRef.current.loadBlob(editMusic);

      wavesurferRef.current.on("play", () => {
        setIsPlaying(true);
      });
      wavesurferRef.current.on("pause", () => {
        setIsPlaying(false);
      });
      wavesurferRef.current.on("finish", () => {
        setIsPlaying(false);
      });
    }
  }, [title, editMusic]);

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
          <div className={s.editor}>
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className={s.gridCell}></div>
            ))}
          </div>
        </div>
        <div className={s.musicInfo}>
          <div className={s.bpm}>pp</div>
          <div className={s.control}>
            <button onClick={() => handleSeek(-5)}>
              <ChevronFirst />
            </button>
            <button className={s.startButton} onClick={handlePlayPause}>
              {isPlaying ? <Pause /> : <Play />}
            </button>
            <button onClick={() => handleSeek(5)}>
              <ChevronLast />
            </button>
          </div>
          <div className={s.musicTitle}>title</div>
        </div>
        <div className={s.noteContainer}></div>
        <div className={s.waveform} ref={waveformRef}></div>
      </div>
    );
  }
}
