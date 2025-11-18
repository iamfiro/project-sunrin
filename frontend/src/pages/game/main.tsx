import s from "@/shared/styles/pages/game/main.module.scss"
import PlayField from "@/components/game/play-field"
import InputHandler from "@/components/game/Input-handler"
import { useInputStore } from "@/store/inputStore"
import { useEffect } from 'react'

export default function GameMain() {
    const { 
        keys, 
        pressedKeys, 
        pressKey, 
        releaseKey, 
        getPressedKeyNames 
    } = useInputStore()

    // Log when pressed keys change
    useEffect(() => {
        const keyNames = getPressedKeyNames()
        console.log(`Pressed keys: ${keyNames.join(', ') || 'None'}`)
    }, [pressedKeys, getPressedKeyNames])

    return (
        <div className={s.container}>
            <PlayField />
            <p>{getPressedKeyNames().join(', ')}</p>
            <InputHandler
                keys={keys}
                onKeyPress={pressKey}
                onKeyRelease={releaseKey}
            />
        </div>
    )
}