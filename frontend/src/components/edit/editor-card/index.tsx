import {
  ChevronFirst,
  ChevronLast,
  Palette,
  Pause,
  Play,
  Trash2,
  X,
} from "lucide-react";
import MusicTempo from "music-tempo";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import WaveSurfer from "wavesurfer.js";

import { saveChart } from "@/shared/api/chartService";
import { useEditorStore } from "@/store/useEditorStore";
import { useNoteStore } from "@/store/useNoteStore";

import LineSection from "../line-section";

import s from "./style.module.scss";

interface Props {
  title: "title" | "music" | "edit";
  onNext: () => void;
}
export default function EditorCard({ title, onNext }: Props) {
  const navigate = useNavigate();
  const waveformRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalSections, setTotalSections] = useState(16);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [musicUrl, setMusicUrl] = useState<string | undefined>(undefined);

  const {
    notes,
    addNote,
    removeNote,
    getSelectedNote,
    updateNote,
    undo,
    redo,
  } = useNoteStore();
  const selectedNote = getSelectedNote();

  const {
    editTitle,
    setEditTitle,
    editMusic,
    setEditMusic,
    bpm,
    setBpm,
    artist,
    setArtist,
    difficulty,
    setDifficulty,
  } = useEditorStore();

  useEffect(() => {
    if (editMusic) {
      const url = URL.createObjectURL(editMusic);
      setMusicUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [editMusic]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { metaKey, ctrlKey, key, shiftKey } = e;
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmd = isMac ? metaKey : ctrlKey;

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo/Redo logic
      if (isCmd && key.toLowerCase() === "z") {
        e.preventDefault();
        if (shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if (isCmd && key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // Note movement logic
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
        case "Backspace":
          removeNote(selectedNote.id);
          break;
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
  }, [selectedNote, updateNote, undo, redo]);

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
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
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

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

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

  const handleSave = async () => {
    if (!editTitle || !editMusic) {
      toast.error("제목과 음악 파일을 모두 입력해주세요.");
      return;
    }

    try {
      // Omit the 'id' from each note, as the backend will assign it.
      const notes_data = notes.map(({ id, ...rest }) => rest);

      const chartData = {
        title: editTitle,
        artist: artist,
        bpm: bpm || 120, // 기본값 120
        notes_data: notes_data,
        musicFile: editMusic,
        difficulty: difficulty,
      };

      await saveChart(chartData);
      toast.success("차트가 성공적으로 저장되었습니다!");
      navigate("/game/select"); // 저장 후 선택 화면으로 이동
    } catch (error) {
      console.error("Error saving chart:", error);
      if (error instanceof Error) {
        toast.error(`차트 저장 중 오류가 발생했습니다: ${error.message}`);
      } else {
        toast.error("차트 저장 중 알 수 없는 오류가 발생했습니다.");
      }
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
            accept="audio/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onMusicSave(file);
              }
            }}
          />
          <input
            type="text"
            placeholder="아티스트"
            onChange={(e) => setArtist(e.target.value)}
          />
          <input
            type="number"
            placeholder="난이도 (1-15)"
            min="1"
            max="15"
            onChange={(e) => setDifficulty(Number(e.target.value))}
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
          <button onClick={handleSave} className={s.saveButton}>
            저장
          </button>
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
          <div className={s.bpmContainer}>
            <p>BPM</p>
            <input
              className={s.bpm}
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>
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
          <div className={s.musicInfoContainer}>
            <h1>제목</h1>
            <p className={s.musicTitle}>{editTitle}</p>
          </div>
        </div>
        <div className={s.noteContainer}>
          <div className={s.noteActions}>
            <button
              onClick={() => handleAddNote("tap")}
              className={s.noteButton}
            >
              숏노트 추가
            </button>
            <button
              onClick={() => handleAddNote("hold")}
              className={s.noteButton}
            >
              롱노트 추가
            </button>
            <button
              onClick={() => setIsColorModalOpen(true)}
              className={s.editButton}
            >
              <Palette size={16} />
              색상 변경
            </button>
            {selectedNote && (
              <>
                <button className={s.deleteButton} onClick={handleDeleteNote}>
                  <Trash2 size={16} />
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
        <div className={s.waveform} ref={waveformRef}></div>
        <video ref={videoRef} src={musicUrl} className={s.video} muted />
      </div>
    );
  }
}
