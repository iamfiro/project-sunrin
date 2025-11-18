import s from "./style.module.scss"
import { Note } from "@/shared/types/game/note"

const basicChartNotes: Note[] = [
  // --- 1박 ---
  { id: "n1", time: 0, lane: 2, type: "tap" },         // 1박자 첫 탭
  { id: "n2", time: 500, lane: 3, type: "tap" },       // 2박 탭
  { id: "n3", time: 1000, lane: 1, type: "hold", duration: 800 }, 
  { id: "n4", time: 1500, lane: 4, type: "tap" },      // 4박 탭
  { id: "n5", time: 2000, lane: 2, type: "hold", duration: 1200 },
  { id: "n6", time: 2500, lane: 3, type: "tap" },
];


export default function PlayField() {
    return (
        <div className={s.container}>
            
        </div>
    )
}