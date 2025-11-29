import {
  ChevronFirst,
  ChevronLast,
  ChevronsLeftRight,
  Pause,
  Play,
  Trash2,
  X,
} from "lucide-react";
import MusicTempo from "music-tempo";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

import { useEditorStore } from "@/store/useEditorStore";
import { useNoteStore } from "@/store/useNoteStore";

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
  const [totalSections, setTotalSections] = useState(16);

  const { notes, addNote, removeNote, getSelectedNote, updateNote } =
    useNoteStore();
  const selectedNote = getSelectedNote();

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
      });
      wavesurferRef.current.loadBlob(editMusic);

      wavesurferRef.current.on("play", () => setIsPlaying(true));
      wavesurferRef.current.on("pause", () => setIsPlaying(false));
      wavesurferRef.current.on("finish", () => setIsPlaying(false));
      wavesurferRef.current.on("ready", () => {
        if (wavesurferRef.current) {
          const duration = wavesurferRef.current.getDuration();
          const sections = Math.ceil(duration / 0.5);
          setTotalSections(sections > 0 ? sections : 16);

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
      wavesurferRef.current.on("seeking", (progress: number) => {
        if (wavesurferRef.current) {
          const currentTime = wavesurferRef.current.getDuration() * progress;
          handleTimeUpdate(currentTime);
        }
      });
    }
  }, [title, editMusic, setBpm, setTotalSections]);

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
    if (isPlaying || !wavesurferRef.current) {
      return;
    }

    const currentScroll = e.currentTarget.scrollLeft;
    const pixelsPerSecond = 800; // 400px per 0.5s
    const expectedScroll =
      wavesurferRef.current.getCurrentTime() * pixelsPerSecond;

    if (Math.abs(currentScroll - expectedScroll) < 5) {
      return;
    }

    const newTime = currentScroll / pixelsPerSecond;
    const duration = wavesurferRef.current.getDuration();
    if (duration > 0) {
      wavesurferRef.current.seekTo(newTime / duration);
    }
  };

  // --- Note Manipulation Handlers ---
  const handleAddNote = (type: "tap" | "hold") => {
    if (!wavesurferRef.current) return;
    const currentTime = wavesurferRef.current.getCurrentTime() * 1000; // Convert to ms
    const newNote = {
      time: Math.round(currentTime),
      lane: 1,
      type: type,
      duration: type === "hold" ? 200 : undefined,
    };
    addNote(newNote);
  };

  const handleDeleteNote = () => {
    if (selectedNote) {
      removeNote(selectedNote.id);
    }
  };

  // Keyboard controls for moving notes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedNote) return;

      const measureDuration = 500;
      let handled = true;

      switch (e.key) {
        case "ArrowUp":
          updateNote(selectedNote.id, {
            lane: Math.max(1, selectedNote.lane - 1),
          });
          break;
        case "ArrowDown":
          updateNote(selectedNote.id, {
            lane: Math.min(4, selectedNote.lane + 1),
          });
          break;
        case "ArrowLeft": {
          const relativeTimeLeft = selectedNote.time % measureDuration;
          const currentSectionStartLeft = selectedNote.time - relativeTimeLeft;
          const newTimeLeft =
            currentSectionStartLeft - measureDuration + relativeTimeLeft;
          updateNote(selectedNote.id, { time: Math.max(0, newTimeLeft) });
          break;
        }
        case "ArrowRight": {
          const relativeTimeRight = selectedNote.time % measureDuration;
          const currentSectionStartRight =
            selectedNote.time - relativeTimeRight;
          const newTimeRight =
            currentSectionStartRight + measureDuration + relativeTimeRight;
          updateNote(selectedNote.id, { time: newTimeRight });
          break;
        }
        default:
          handled = false;
          break;
      }

      if (handled) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNote, updateNote]);

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
              const notesForSection = notes.filter(
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
        <div className={s.noteContainer}>
          <div className={s.noteActions}>
            <button onClick={() => handleAddNote("tap")}>숏노트 추가</button>
            <button onClick={() => handleAddNote("hold")}>롱노트 추가</button>
          </div>
          {selectedNote && (
            <div className={s.noteActions}>
              <p>
                선택된 노트: {selectedNote.type} (T: {selectedNote.time}ms, L:{" "}
                {selectedNote.lane})
              </p>
              <button className={s.deleteButton} onClick={handleDeleteNote}>
                <Trash2 />
                삭제
              </button>
            </div>
          )}
        </div>
        <div className={s.waveform} ref={waveformRef}></div>
      </div>
    );
  }
}
