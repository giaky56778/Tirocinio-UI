import {PointerEvent, RefObject, useCallback, useRef} from "react";
import {getClosestWordIdx} from "@/utils/util.ts";

type usePointerProps={
    selectText: {
        onUpdateSelection:(currentWordId: { spanID: number | null; divID: number | null })=> void
        onClearSelection:()=> void
    }
    highlightState:{
        update:(id:number)=> void
        deselectHandle:()=>void
        whichIsPressed:()=> ("left" | "right" | null)
    }
    blockSelectedRef?: RefObject<boolean>
}

export type PointerType={
    isBlocked: RefObject<boolean>,
    handlePointerDown:(event: PointerEvent<HTMLDivElement>)=> void
    handlePointerMove:(event: PointerEvent<HTMLDivElement>)=> void
    onPointerUp:()=> void
}

type HtmlElType= HTMLElement | null

export default function usePointer({selectText,highlightState, blockSelectedRef: externalBlockRef}:usePointerProps):PointerType {

    const internalBlockRef = useRef<boolean>(false)
    const blockSelectedRef = externalBlockRef ?? internalBlockRef
    const requestRef = useRef<number | null>(null)
    const latestEventRef = useRef<PointerEvent<HTMLDivElement> | null>(null)

    const isPressed=useRef<boolean>(false)
    const lastWordId = useRef<{
        spanID: number |null,
        divID:number|null,
        spanFound: number|null
    } |null>(null)
    const lastHandleSpanId = useRef<number | null>(null)

    function findSpanID (event: PointerEvent<HTMLDivElement>) {
        const elements = document.elementsFromPoint(event.clientX, event.clientY)
        let divID=-1
        let spanFound=-1
        let lineDiv: HtmlElType = null

        for (const el of elements) {
            if (!(el instanceof HTMLElement))
                continue
            
            if (!lineDiv)
                lineDiv = el.closest('div[data-line-index]')
            
            const divFind :HtmlElType = el.closest('div[data-index]')
            const spanFind :HtmlElType = el.closest('span[data-word-id]')
            
            if (divID === -1 && divFind)
                divID = Number(divFind.dataset.index)
            if (spanFound === -1 && spanFind)
                spanFound = Number(spanFind.dataset.wordId)
            
            if (lineDiv && divID !== -1 && spanFound !== -1)
                break
        }

        const span = getClosestWordIdx(event, lineDiv)

        return {
            spanID: span,
            divID:  divID,
            spanFound:spanFound
        }
    }

    function handlePointerDown (event: PointerEvent<HTMLDivElement>) {
        if(blockSelectedRef.current)
            return
        if(event.buttons===1){ // 1 = mouse sinistro
            isPressed.current=true
            selectText.onClearSelection()
        }
    }

    function reset() {
        isPressed.current=false
        lastWordId.current=null
        lastHandleSpanId.current=null
        highlightState.deselectHandle()
    }

    const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
        latestEventRef.current = event

        if (requestRef.current !== null) {
            return
        }

        requestRef.current = requestAnimationFrame(() => { 
            const ev = latestEventRef.current
            if (!ev) {
                requestRef.current = null
                return
            }

            if(isPressed.current){
                if(blockSelectedRef.current) {
                    requestRef.current = null
                    return
                }

                const wordId = findSpanID(ev)

                if (wordId.spanID !== null && (lastWordId.current?.spanID !== wordId.spanID || lastWordId.current?.divID !== wordId.divID)) {
                    lastWordId.current = wordId
                    selectText.onUpdateSelection(wordId)
                }
            }else{
                const press = highlightState.whichIsPressed()
                if (press != null) {
                    if(blockSelectedRef.current) {
                        requestRef.current = null
                        return
                    }
                    const wordId = findSpanID(ev)
                    if (wordId.spanID !== null && lastHandleSpanId.current !== wordId.spanID) {
                        lastHandleSpanId.current = wordId.spanID
                        highlightState.update(wordId.spanID)
                    }
                }
            }
            
            requestRef.current = null
        })
    }, [selectText, highlightState, blockSelectedRef])

    return {
        isBlocked: blockSelectedRef,
        handlePointerDown,
        handlePointerMove,
        onPointerUp:reset
    }
}
