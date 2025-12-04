import {
  ChevronFirst,
  ChevronLast,
  Image,
  Music,
  Palette,
  Pause,
  Play,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import MusicTempo from "music-tempo";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [, setIsColorModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const { notes, removeNote, getSelectedNote, updateNote, undo, redo } =
    useNoteStore();
  const selectedNote = getSelectedNote();

  const {
    editTitle,
    setEditTitle,
    editMusic,
    setEditMusic,
    coverImage,
    setCoverImage,
    coverPreviewUrl,
    editVideoUrl,
    bpm,
    setBpm,
    artist,
    setArtist,
    difficulty,
    setDifficulty,
  } = useEditorStore();

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

      // wavesurfer seeking 이벤트 (웨이브폼 클릭 시)
      wavesurferRef.current.on("seeking", (progress: number) => {
        if (wavesurferRef.current && !isPlaying) {
          const time = wavesurferRef.current.getDuration() * progress;
          setCurrentTime(time);

          // 비디오 동기화
          if (videoRef.current) {
            videoRef.current.currentTime = time;
          }

          // 에디터 스크롤 동기화
          if (editorRef.current) {
            const pixelsPerSecond = 400;
            const targetScroll = time * pixelsPerSecond;
            const editorWidth = editorRef.current.clientWidth;
            editorRef.current.scrollLeft = targetScroll - editorWidth / 3;
          }
        }
      });
    }
  }, [title, editMusic, setBpm, setTotalSections]);

  // requestAnimationFrame을 사용한 부드러운 스크롤 동기화
  const animationFrameRef = useRef<number | null>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 정지 시 현재 위치에 고정하는 함수
  const syncScrollToCurrentTime = useCallback(() => {
    const video = videoRef.current;
    const editor = editorRef.current;

    if (video && editor) {
      const time = video.currentTime;
      const pixelsPerSecond = 400;
      const targetScroll = time * pixelsPerSecond;
      const editorWidth = editor.clientWidth;
      editor.scrollLeft = targetScroll - editorWidth / 3;
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        // 정지 시 현재 위치에 고정
        syncScrollToCurrentTime();
      }
    }
  }, [isPlaying, syncScrollToCurrentTime]);

  useEffect(() => {
    const animate = () => {
      const video = videoRef.current;
      const editor = editorRef.current;

      // 재생 중일 때만 스크롤 업데이트
      if (
        video &&
        !video.paused &&
        editor &&
        !isUserScrollingRef.current &&
        isPlaying
      ) {
        const time = video.currentTime;
        setCurrentTime(time);

        // 200px per 500ms = 400px per second
        const pixelsPerSecond = 400;
        const targetScroll = time * pixelsPerSecond;
        const editorWidth = editor.clientWidth;

        // 부드러운 스크롤 (현재 위치와 목표 위치 사이를 보간)
        const currentScroll = editor.scrollLeft;
        const targetPosition = targetScroll - editorWidth / 3;
        const diff = targetPosition - currentScroll;

        // 차이가 크면 즉시 이동, 작으면 부드럽게
        if (Math.abs(diff) > 500) {
          editor.scrollLeft = targetPosition;
        } else {
          editor.scrollLeft = currentScroll + diff * 0.15;
        }
      }

      // 재생 중일 때만 다음 프레임 요청
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // 정지 시 현재 위치에 고정
      syncScrollToCurrentTime();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, syncScrollToCurrentTime]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
        // 정지 시 현재 위치에 고정
        syncScrollToCurrentTime();
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

  const onCoverSave = (file: File) => {
    setCoverImage(file);
  };

  const [isDraggingMusic, setIsDraggingMusic] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  const handleMusicDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingMusic(false);
      const file = e.dataTransfer.files[0];
      if (
        file &&
        (file.type.startsWith("audio/") || file.type.startsWith("video/"))
      ) {
        onMusicSave(file);
      } else {
        toast.error("오디오 또는 비디오 파일만 업로드 가능합니다.");
      }
    },
    [onMusicSave],
  );

  const handleCoverDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingCover(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onCoverSave(file);
      } else {
        toast.error("이미지 파일만 업로드 가능합니다.");
      }
    },
    [onCoverSave],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // 재생 중일 때는 자동 스크롤이 처리하므로 무시
    if (isPlaying) {
      return;
    }

    // 사용자가 스크롤 중임을 표시
    isUserScrollingRef.current = true;

    // 이전 타임아웃 클리어
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const currentScroll = e.currentTarget.scrollLeft;
    // 200px per 500ms = 400px per second
    const pixelsPerSecond = 400;
    const newTime = currentScroll / pixelsPerSecond;

    // 시간 업데이트
    setCurrentTime(newTime);

    // wavesurfer와 video 동기화
    if (wavesurferRef.current) {
      const duration = wavesurferRef.current.getDuration();
      if (duration > 0) {
        const clampedTime = Math.max(0, Math.min(newTime, duration));
        wavesurferRef.current.seekTo(clampedTime / duration);
      }
    }

    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, newTime);
    }

    // 스크롤이 끝나면 플래그 해제
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  };

  // --- Note Manipulation Handlers ---
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
      const notes_data = notes.map(({ id: _id, ...rest }) => rest);

      const chartData = {
        title: editTitle,
        artist: artist,
        bpm: bpm || 120, // 기본값 120
        notes_data: notes_data,
        musicFile: editMusic,
        difficulty: difficulty,
        coverFile: coverImage || undefined,
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
          <div className={s.inputGroup}>
            <label>곡 제목</label>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={editTitle}
              onChange={(e) => onTitleSave(e.target.value)}
            />
          </div>
          <button onClick={onNext} disabled={!editTitle.trim()}>
            다음으로
          </button>
        </div>
      </div>
    );
  } else if (title === "music") {
    return (
      <div className={s.contents}>
        <div className={s.header}>
          <div className={s.spacer}></div>
          <h2>음악 & 커버 설정</h2>
          <X scale={24} color="#8E8E8E" />
        </div>
        <div className={s.body}>
          <div className={s.uploadSection}>
            {/* 음악 파일 업로드 영역 */}
            <div
              className={`${s.uploadArea} ${isDraggingMusic ? s.dragging : ""} ${editMusic ? s.hasFile : ""}`}
              onDrop={handleMusicDrop}
              onDragOver={handleDragOver}
              onDragEnter={() => setIsDraggingMusic(true)}
              onDragLeave={() => setIsDraggingMusic(false)}
              onClick={() => document.getElementById("music-input")?.click()}
            >
              <input
                id="music-input"
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onMusicSave(file);
                  }
                }}
              />
              <div className={s.uploadIcon}>
                {editMusic ? (
                  <Music size={48} strokeWidth={1.5} />
                ) : (
                  <Upload size={48} strokeWidth={1.5} />
                )}
              </div>
              <div className={s.uploadText}>
                {editMusic ? (
                  <>
                    <span className={s.fileName}>{editMusic.name}</span>
                    <span className={s.fileSize}>
                      {(editMusic.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <span className={s.uploadTitle}>음악 파일 업로드</span>
                    <span className={s.uploadHint}>
                      드래그하거나 클릭하여 업로드
                    </span>
                    <span className={s.uploadFormats}>
                      MP4 지원 (영상이 있어야 됨)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 앨범 커버 업로드 영역 */}
            <div
              className={`${s.uploadArea} ${s.coverArea} ${isDraggingCover ? s.dragging : ""} ${coverImage ? s.hasFile : ""}`}
              onDrop={handleCoverDrop}
              onDragOver={handleDragOver}
              onDragEnter={() => setIsDraggingCover(true)}
              onDragLeave={() => setIsDraggingCover(false)}
              onClick={() => document.getElementById("cover-input")?.click()}
            >
              <input
                id="cover-input"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onCoverSave(file);
                  }
                }}
              />
              {coverPreviewUrl ? (
                <div className={s.coverPreview}>
                  <img src={coverPreviewUrl} alt="앨범 커버 미리보기" />
                  <div className={s.coverOverlay}>
                    <Image size={24} />
                    <span>변경하기</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className={s.uploadIcon}>
                    <Image size={48} strokeWidth={1.5} />
                  </div>
                  <div className={s.uploadText}>
                    <span className={s.uploadTitle}>앨범 커버</span>
                    <span className={s.uploadHint}>이미지 업로드</span>
                    <span className={s.uploadFormats}>PNG, JPG 권장</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={s.inputGroup}>
            <label>아티스트</label>
            <input
              type="text"
              placeholder="아티스트 이름을 입력하세요"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>

          <div className={s.inputGroup}>
            <label>난이도</label>
            <input
              type="number"
              placeholder="1 ~ 15"
              min="1"
              max="15"
              value={difficulty || ""}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            />
          </div>

          <button onClick={onNext} disabled={!editMusic}>
            다음으로
          </button>
        </div>
      </div>
    );
  } else if (title === "edit") {
    return (
      <div className={s.editWrapper}>
        {/* 배경 비디오 */}
        <video
          ref={videoRef}
          src={editVideoUrl || undefined}
          className={s.videoBackground}
          muted
          playsInline
        />
        <div className={s.videoOverlay} />

        {/* 상단 바 */}
        <div className={s.topBar}>
          <img src="/logo_brand.svg" alt="logo" />
          <div className={s.titleSection}>
            <h1>{editTitle}</h1>
            <span>•</span>
            <span>{artist || "Unknown Artist"}</span>
          </div>
          <button onClick={handleSave} className={s.saveButton}>
            저장
          </button>
        </div>

        {/* 메인 노트 에디터 영역 */}
        <div className={s.previewArea}>
          <div className={s.mainEditor} ref={editorRef} onScroll={handleScroll}>
            {/* 재생 위치 표시선 */}
            <div
              className={s.playhead}
              style={{
                left: `${currentTime * 400}px`,
              }}
            />
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

        {/* 하단 패널 */}
        <div className={s.bottomPanel}>
          {/* 컨트롤 바 */}
          <div className={s.controlBar}>
            <div className={s.leftControls}>
              <div className={s.bpmContainer}>
                <p>BPM</p>
                <input
                  className={s.bpm}
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                />
              </div>
              <div className={s.timeDisplay}>
                {`${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, "0")}`}
              </div>
            </div>

            <div className={s.centerControls}>
              <div className={s.control}>
                <button onClick={() => handleSeek(-5)}>
                  <ChevronFirst size={18} />
                </button>
                <button className={s.playButton} onClick={handlePlayPause}>
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={() => handleSeek(5)}>
                  <ChevronLast size={18} />
                </button>
              </div>
            </div>

            <div className={s.rightControls}>
              <div className={s.musicInfoContainer}>
                <h1>곡명</h1>
                <p className={s.musicTitle}>{editTitle}</p>
              </div>
            </div>
          </div>

          {/* 노트 액션 바 */}
          <div className={s.noteContainer}>
            <div className={s.noteActions}>
              <span className={s.helpText}>
                💡 그리드에 마우스를 올리면 반투명 노트가 보이고, 클릭하면
                숏노트, 드래그하면 롱노트가 추가됩니다
              </span>
              <button
                onClick={() => setIsColorModalOpen(true)}
                className={s.editButton}
              >
                <Palette size={14} />
                색상
              </button>
              {selectedNote && (
                <button className={s.deleteButton} onClick={handleDeleteNote}>
                  <Trash2 size={14} />
                  삭제
                </button>
              )}
            </div>
          </div>

          {/* 타임라인 섹션 */}
          <div className={s.timelineSection}>
            {/* 웨이브폼 */}
            <div className={s.waveform} ref={waveformRef}></div>
          </div>
        </div>
      </div>
    );
  }
}
