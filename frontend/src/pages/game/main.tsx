import s from "@/shared/styles/pages/game/main.module.scss"
import PlayField from "@/components/game/play-field"
import { useInputStore } from "@/store/inputStore"
import { useEffect } from 'react'

export default function GameMain() {
    const { 
        pressedKeys, 
        getPressedKeyNames 
    } = useInputStore()

    // Log when pressed keys change
    useEffect(() => {
        const keyNames = getPressedKeyNames()
        console.log(`Pressed keys: ${keyNames.join(', ') || 'None'}`)
    }, [pressedKeys, getPressedKeyNames])

    return (
        <div className={s.container}>
            <div>
                배경
            </div>
            <PlayField />
            <div>
                배경
            </div>
        </div>
    )
}