import {useState, useCallback, useRef} from "react";

export type DragType={
    highlightId:string
    handle:'left'|'right'|''
}

export default function useHighlightUI(){
    const dragRef = useRef<'left'|'right'|null>(null)
    const pressedRef = useRef<boolean>(false)
    const [lastPressedHandle, setLastPressedHandle] = useState<'left'|'right'|null>(null)

    const selectHandle = useCallback((handle: 'left'|'right') => {
        dragRef.current = handle
        pressedRef.current = true
        setLastPressedHandle(handle)
    }, [])

    const deselectHandle = useCallback(() => {
        dragRef.current = null
        pressedRef.current = false
    }, [])

    const whichIsPressed = useCallback((): 'left'|'right'|null => {
        if (!pressedRef.current || !dragRef.current) return null
        return dragRef.current
    }, [])

    return {
        selectHandle,
        deselectHandle,
        whichIsPressed,
        lastPressedHandle,
    }
}
