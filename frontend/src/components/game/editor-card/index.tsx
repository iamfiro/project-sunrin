import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

import s from "./style.module.scss";

interface Props {
  title: "title" | "music" | "edit";
  onNext: () => void;
}
export default function EditorCard({ title, onNext }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    if (title === "edit" && selectedFile && waveformRef.current) {
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
      wavesurferRef.current.loadBlob(selectedFile);
    }
  }, [title, selectedFile]);

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
          <input type="text" placeholder="제목을 입력하세요" />
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
          <input type="file" accept="audio/*" onChange={handleFileChange} />
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
          <div className={s.bpm}></div>
          <div className={s.musicTitle}></div>
        </div>
        <div className={s.noteContainer}></div>
        <div className={s.waveform} ref={waveformRef}></div>
      </div>
    );
  }
}
