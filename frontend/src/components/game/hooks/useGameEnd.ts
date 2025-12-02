import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Note } from "@/shared/types/game/note";

export const useGameEnd = (notes: Note[]) => {
  const navigate = useNavigate();
  const hasGameEnded = useRef(false);
  const videoEndedRef = useRef(false);
  const notesRef = useRef(notes);
  
  // notes가 변경될 때마다 ref 업데이트
  notesRef.current = notes;

  const checkAndNavigate = useCallback(() => {
    if (hasGameEnded.current) return;
    
    // 노트가 아직 남아있으면 1초 후 다시 체크
    if (notesRef.current.length > 0) {
      setTimeout(checkAndNavigate, 1000);
      return;
    }
    
    // 노트가 모두 처리되었으면 결과 페이지로 이동
    hasGameEnded.current = true;
    navigate("/game/result");
  }, [navigate]);

  const handleVideoEnd = useCallback(() => {
    if (videoEndedRef.current) return;
    videoEndedRef.current = true;
    
    // 비디오가 끝났을 때, 노트가 남아있으면 1초 후 다시 체크
    // 노트가 없으면 바로 결과 페이지로 이동
    setTimeout(checkAndNavigate, 1000);
  }, [checkAndNavigate]);

  return { handleVideoEnd };
};
