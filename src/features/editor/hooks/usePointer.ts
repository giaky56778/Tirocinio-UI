import {useRef, useCallback} from 'react';
import type React from "react";
import {WORD_PROXIMITY_PX} from "@/utils/settings.ts";
import {useSelectionStoreContext} from "@/features/editor/store/useSelectionStore.tsx";

function getClosestWordIdx(event: React.PointerEvent<HTMLDivElement> | PointerEvent, lineDiv: HTMLElement | null): number | null {
    if (!lineDiv)
        return null

    const spans:HTMLElement[] = Array.from(lineDiv.querySelectorAll("span[data-word-id]"))
    let closestSpanId=-1
    let minDistance = Infinity
    for (const span of spans) {
        const rect = span.getBoundingClientRect()
        const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right)
        const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom)
        const distance = Math.sqrt(dx * dx + dy * dy)
        if(distance < minDistance) {
            minDistance = distance
            closestSpanId = Number(span.dataset.wordId)
        }
    }
    if(minDistance <= WORD_PROXIMITY_PX && closestSpanId !== -1)
        return closestSpanId

    return null
}


type Props={
    onPointerDown: () => void
    onPointerUp: () => void
    selectionUpdate: (wordId: { spanID: number | null; divID: number | null }) => void
    updateHighlight: (wordId: { spanID: number | null; divID: number | null }) => void
}

export type PointerType={
    handlePointerDown:(event: React.PointerEvent<HTMLDivElement>)=> void
    handlePointerMove:(event: React.PointerEvent<HTMLDivElement>)=> void
    onPointerUp:()=> void
}

type HtmlElType= HTMLElement | null

export default function usePointer({onPointerDown, onPointerUp, selectionUpdate, updateHighlight}:Props):PointerType {
    const selectionStore = useSelectionStoreContext()

    const requestRef = useRef<number | null>(null)
    const latestEventRef = useRef<React.PointerEvent<HTMLDivElement> | null>(null)

    const isPressed=useRef<boolean>(false)
    const lastWordId = useRef<{
        spanID: number |null,
        divID:number|null,
        spanFound: number|null
    } |null>(null)
    const lastHandleSpanId = useRef<number | null>(null)

    function findSpanID (event: React.PointerEvent<HTMLDivElement>) {
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

    function handlePointerDown (event: React.PointerEvent<HTMLDivElement>) {
        if(selectionStore.getState().isSelectionBlocked)
            return
        if(event.buttons===1){ // 1 = mouse sinistro
            isPressed.current=true
            onPointerDown()
        }
    }

    function reset() {
        isPressed.current=false
        lastWordId.current=null
        lastHandleSpanId.current=null
        onPointerUp()
    }

    const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        latestEventRef.current = event

        if (requestRef.current !== null)
            return

        requestRef.current = requestAnimationFrame(() => { 
            const e = latestEventRef.current
            if (!e) {
                requestRef.current = null
                return
            }

            if(isPressed.current){
                if(selectionStore.getState().isSelectionBlocked) {
                    requestRef.current = null
                    return
                }

                const wordId = findSpanID(e)

                if (wordId.spanID !== null && (lastWordId.current?.spanID !== wordId.spanID || lastWordId.current?.divID !== wordId.divID)) {
                    lastWordId.current = wordId
                    selectionUpdate(wordId)
                }
            }else{
                if(selectionStore.getState().isSelectionBlocked) {
                    requestRef.current = null
                    return
                }
                const wordId = findSpanID(e)
                if (wordId.spanID !== null && lastHandleSpanId.current !== wordId.spanID) {
                    lastHandleSpanId.current = wordId.spanID
                    updateHighlight(wordId)
                }
            }
            
            requestRef.current = null
        })
    }, [selectionUpdate, updateHighlight, selectionStore])

    return {
        handlePointerDown,
        handlePointerMove,
        onPointerUp:reset
    }
}
