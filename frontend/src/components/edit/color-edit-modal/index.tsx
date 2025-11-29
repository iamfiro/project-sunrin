import { useEffect, useState } from "react";

import Modal from "@/shared/components/modal";
import { useNoteStore } from "@/store/useNoteStore";

import styles from "./style.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ColorEditModal({ isOpen, onClose }: Props) {
  const { shortNoteColor, longNoteColor, setShortNoteColor, setLongNoteColor } =
    useNoteStore();

  const [draftShortColor, setDraftShortColor] = useState(shortNoteColor);
  const [draftLongColor, setDraftLongColor] = useState(longNoteColor);

  useEffect(() => {
    if (isOpen) {
      setDraftShortColor(shortNoteColor);
      setDraftLongColor(longNoteColor);
    }
  }, [isOpen, shortNoteColor, longNoteColor]);

  const handleSave = () => {
    setShortNoteColor(draftShortColor);
    setLongNoteColor(draftLongColor);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="노트 색상 변경">
      <div className={styles.container}>
        <div className={styles.colorPickerGroup}>
          <label htmlFor="shortNoteColor">
            <p>숏노트 색상</p>
          </label>
          <input
            id="shortNoteColor"
            type="color"
            value={draftShortColor}
            onChange={(e) => setDraftShortColor(e.target.value)}
          />
        </div>
        <div className={styles.colorPickerGroup}>
          <label htmlFor="longNoteColor">
            <p>롱노트 색상</p>
          </label>
          <input
            id="longNoteColor"
            type="color"
            value={draftLongColor}
            onChange={(e) => setDraftLongColor(e.target.value)}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={handleCancel}>취소</button>
          <button onClick={handleSave} className={styles.saveButton}>
            저장
          </button>
        </div>
      </div>
    </Modal>
  );
}
