import { ChevronFirst, ChevronLast, Pause, Play, X } from "lucide-react";
import MusicTempo from "music-tempo";
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
        const audioBuffer = wavesurferRef.current?.getDecodedData();
        if (audioBuffer) {
          // Get the first channel's audio data as Float32Array
          const audioData = audioBuffer.getChannelData(0);
          const musicTempo = new MusicTempo(audioData);
          setBpm(Math.round(musicTempo.tempo));
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
