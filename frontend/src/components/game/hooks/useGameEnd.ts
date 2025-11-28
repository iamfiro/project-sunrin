import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Note } from "@/shared/types/game/note";

export const useGameEnd = (notes: Note[]) => {
  const navigate = useNavigate();
  const hasGameEnded = useRef(false);

  useEffect(() => {
    if (!hasGameEnded.current && notes.length === 0) {
      hasGameEnded.current = true;

      const timer = setTimeout(() => {
        // navigate("/game/result");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [notes, navigate]);
};


