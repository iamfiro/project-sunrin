import s from "@/shared/styles/pages/game/main.module.scss"
import PlayField from "@/components/game/play-field"

export default function GameMain() {
    return (
        <div className={s.container}>
            <PlayField />
        </div>
    )
}