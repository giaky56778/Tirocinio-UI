import {useState} from "react";
import {type ScrollToIndexAlign} from "virtua";

export type SetScrollProps = {
    lineIndex?: number
    highlightId?: string | null
    mode?: ScrollToIndexAlign
}

export type ScrollType = {
    blinkHighlightId: string | null
    mode: ScrollToIndexAlign
    setScroll: (params: SetScrollProps) => void
    lineToScroll: () => { value: number, mode: ScrollToIndexAlign } | null
    isNavigating: boolean
    onMoved: () => void
}

const DEFAULT_MODE: ScrollToIndexAlign = 'start'

export default function useScrollDynamic():ScrollType{
    const [lineTo, setLineTo] = useState<number>(-1)
    const [blinkHighlightId,setBlinkHighlightId] = useState<string|null>(null)
    const [isNavigating, setIsNavigating] = useState<boolean>(false)
    const [mode, setMode] = useState<ScrollToIndexAlign>(DEFAULT_MODE)

    function setScroll({lineIndex, highlightId, mode = DEFAULT_MODE}: SetScrollProps){
        if(lineIndex==undefined)
            return
        if (mode != undefined) {
            setMode(mode)
        }
        setBlinkHighlightId(highlightId ?? null)
        setLineTo(lineIndex)
        setIsNavigating(true)
    }

    function lineToScroll(){
        if(lineTo!==-1) {
            const value = lineTo
            const vMode=mode

            setMode(DEFAULT_MODE)
            setLineTo(-1)

            if(isNavigating)
                setTimeout(() => {
                    setBlinkHighlightId(null)
                },6000)

            return {value:value, mode:vMode}
        }
        return null
    }

    function onMoved(){
        setIsNavigating(false)
    }

    return {
        blinkHighlightId,
        mode,
        setScroll,
        lineToScroll,
        isNavigating,
        onMoved
    }
}
