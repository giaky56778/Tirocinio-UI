import {DragType} from "@/features/editor/hooks/useEditorUI.ts";
import {TextIndexSchema} from "@/api/indexType.ts";
import {HighlightColor, HighlightSingle} from "@/features/double-editor/components/doubleEditor.tsx";

// -- Type --------------------------------------------------------------

export type HighlightBound = {
    startWord: number
    lineStart: number
    endWord: number
    lineEnd: number
}

export type HighlightLine = {
    highlightId: string,
    startWord?: number
    endWord?: number
    entireLine: boolean
}

export type HighlightReducerError = {
    code: "INVALID_RIGHT_HANDLE_SPAN"|"INVALID_LEFT_HANDLE_SPAN"
    message: string
    handle: 'right'|'left'
    highlightId:string
    maxId: number
}

export type stateType = {
    highlightBounds: Record<string, HighlightBound>
    startEndPosition: Record<number, HighlightLine[]>
    prevWordId:number
    lastError: HighlightReducerError | null
}

type defaultState = {
    indexPerLine: TextIndexSchema | null
    highlightWords: Record<string, HighlightColor>|undefined
}


// -- Action types  --------------------------------------------------------------

export type actionType =
    {
        type: "UPDATE_HIGHLIGHT"
        payload: {
            id: number
            drag: DragType
            indexPerLine: TextIndexSchema
        }
    } | {
        type: "RESTORE"
        payload: {
            prevState: stateType
        }
    } | {
        type: "RESET_ERROR"
    } | {
        type: "REMOVE_HIGHLIGHT"
        payload: {
            highlightId: string
        }
    } | {
        type: "REINIT"
        payload: {
            highlightWords: Record<string, HighlightColor> | undefined
            indexPerLine: TextIndexSchema | null
        }
    }

// -- Reducer --------------------------------------------------------------

export function wordHighlightReducer(
    state: stateType,
    action: actionType
): stateType {
    switch (action.type) {
        case "UPDATE_HIGHLIGHT": {
            const { id, drag, indexPerLine } = action.payload

            if(drag.handle==='')
                return state

            const currentBound = state.highlightBounds[drag.highlightId]

            if (invalidMove(id, state.prevWordId, currentBound, drag, state.lastError))
                return state

            const targetLine = resolveLineByWordId(indexPerLine, id)
            if (targetLine === -1)
                return {
                    ...state,
                    lastError: null
                }

            const overlap = checkOverlap(state.startEndPosition, targetLine, id, drag, currentBound)
            const nextTargetWord = overlap.isValid ? id : overlap.error?.maxId
            if (nextTargetWord === undefined)
                return state

            const nextTargetLine = resolveLineByWordId(indexPerLine, nextTargetWord)
            if (nextTargetLine === -1)
                return {
                    ...state,
                    prevWordId: id,
                    lastError: overlap.error ?? null
                }

            const updatedBound = computeUpdatedBound(currentBound, drag.handle, nextTargetWord, nextTargetLine)
            const startEndPosition = addHighlightToRecord(
                state.startEndPosition,
                drag.highlightId,
                updatedBound,
                currentBound
            )

            return {
                ...state,
                startEndPosition,
                highlightBounds: {
                    ...state.highlightBounds,
                    [drag.highlightId]: updatedBound
                },
                prevWordId: id,
                lastError: overlap.error ?? null
            }
        }

        case "RESTORE":
            return {
                ...action.payload.prevState
            }

        case "RESET_ERROR":
            return {
            ...state,
            lastError: null
        }

        case "REMOVE_HIGHLIGHT": {
            const { highlightId } = action.payload
            const newRecord = copyRecordWithoutHighlight(state.startEndPosition, highlightId)
            const { [highlightId]: _, ...newBounds } = state.highlightBounds;
            return({
                ...state,
                startEndPosition:newRecord,
                highlightBounds:newBounds,
            })
        }

        case "REINIT": {
            const { highlightWords, indexPerLine } = action.payload
            if (indexPerLine == null || highlightWords == null) {
                return {
                    startEndPosition: {},
                    highlightBounds: {},
                    prevWordId: -1,
                    lastError: null
                }
            }
            return initializeWordIndexReducer(highlightWords, indexPerLine)
        }

        default:
            return {
                ...state,
                lastError:null
            }
    }
}

// -- Inizializzazione stato --------------------------------------------------

export function initState({ indexPerLine, highlightWords }: defaultState): stateType {
    if(indexPerLine==null || highlightWords==null) return {
        startEndPosition: {},
        highlightBounds: {},
        prevWordId:-1,
        lastError: null
    }
    return initializeWordIndexReducer(highlightWords,indexPerLine)
}

export function initializeWordIndexReducer(
    highlight: Record<string, HighlightColor>,
    indexPerLine:TextIndexSchema
): stateType {
    const highlightBounds= buildHighlightBounds(highlight,indexPerLine)
    const startEndPosition= buildStartEndPosition(highlightBounds)

    return {
        startEndPosition: startEndPosition,
        highlightBounds: highlightBounds,
        prevWordId:-1,
        lastError: null
    }
}

// -- Funzioni utility --------------------------------------------------------------

function buildHighlightBounds(
    highlight: Record<string, HighlightColor>,
    indexPerLine:TextIndexSchema
){
    return Object.entries(highlight).reduce((record, [id,h]) => {
        let startLine=-1
        let endLine=-1
        for(let i=0;i<=indexPerLine.maxIndex;i++){
            if(indexPerLine.content[i]==null)
                continue
            if(h.position.startWord>=indexPerLine.content[i].start && h.position.startWord<indexPerLine.content[i].end){
                startLine=i
            }
            if(h.position.endWord>=indexPerLine.content[i].start && h.position.endWord<indexPerLine.content[i].end){
                endLine=i
            }
            if(endLine!==-1 && startLine!==-1)
                break
        }
        record[id] = {lineEnd: endLine, lineStart: startLine, startWord: h.position.startWord, endWord: h.position.endWord}
        return record
    }, {} as Record<string, HighlightBound>)
}

function buildStartEndPosition(highlightBoundsInit:Record<string, HighlightBound>) {
    const startEndPositionInit: Record<number, HighlightLine[]> = {}
    for (const [id,h] of Object.entries(highlightBoundsInit)) {
        const startLine = highlightBoundsInit[id].lineStart
        const endLine = highlightBoundsInit[id].lineEnd
        buildLineStartEndPosition(
            startLine,
            endLine,
            {   startWord:h.startWord,
                endWord:h.endWord
            },
            id,
            startEndPositionInit
        )
    }
    return startEndPositionInit
}

function buildLineStartEndPosition(
    startLine:number,
    endLine:number,
    highlight:HighlightSingle,
    id:string,
    startEndPositionInit:Record<number,HighlightLine[]>,
){

    upsertLineMarker(startLine, {highlightId: id,startWord: highlight.startWord,entireLine: false}, startEndPositionInit)
    for (let i = startLine + 1; i < endLine; i++) {
        upsertLineMarker(i, {highlightId: id, entireLine: true}, startEndPositionInit)
    }
    upsertLineMarker(endLine, {highlightId: id, endWord: highlight.endWord, entireLine: false}, startEndPositionInit)
}

function upsertLineMarker(id: number, lineInfo: HighlightLine, startEndPositionInit:Record<number,HighlightLine[]>) {
    const row = (startEndPositionInit[id] ??= [])
    const boundFind = row.find((item) => item.highlightId === lineInfo.highlightId)
    if (boundFind!==undefined) {
        if (lineInfo.startWord !== undefined)
            boundFind.startWord = lineInfo.startWord
        if (lineInfo.endWord !== undefined)
            boundFind.endWord = lineInfo.endWord
        return
    }
    row.push({...lineInfo})
}

export function resolveLineByWordId(indexPerLine: TextIndexSchema | null | undefined, wordId: number): number {
    if (!indexPerLine) return -1
    for(let i=0;i<=indexPerLine.maxIndex;i++){
        if(indexPerLine.content[i]==null)
            continue

        if(indexPerLine.content[i].start <= wordId && indexPerLine.content[i].end > wordId)
            return i
    }
    return -1
}

function computeUpdatedBound(
    bound: HighlightBound,
    handle: DragType["handle"],
    wordId: number,
    lineId: number
): HighlightBound {
    if (handle === "left") {
        const isCollapsing = wordId > bound.startWord
        return {
            lineStart: isCollapsing ? lineId : Math.min(bound.lineStart, lineId),
            lineEnd: bound.lineEnd,
            startWord: isCollapsing ? wordId : Math.min(wordId, bound.startWord),
            endWord: bound.endWord
        }
    }

    const isCollapsing = wordId < bound.endWord
    return {
        lineStart: bound.lineStart,
        lineEnd: isCollapsing ? lineId : Math.max(bound.lineEnd, lineId),
        startWord: bound.startWord,
        endWord: isCollapsing ? wordId : Math.max(wordId, bound.endWord),
    }
}

function addHighlightToRecord(
    startEndPosition: Record<number, HighlightLine[]>,
    highlightId: string,
    newBound: HighlightBound,
    oldBound: HighlightBound
): Record<number, HighlightLine[]> {

    const isSameBound = (a: HighlightBound, b: HighlightBound) => (
        a.lineStart === b.lineStart
        && a.lineEnd   === b.lineEnd
        && a.startWord === b.startWord
        && a.endWord   === b.endWord
    )

    if (isSameBound(oldBound, newBound))
        return startEndPosition

    const affectedLines = new Set<number>()

    addRangeToSet(affectedLines, oldBound.lineStart, oldBound.lineEnd);
    addRangeToSet(affectedLines, newBound.lineStart, newBound.lineEnd);

    const newRecord = { ...startEndPosition }
    let hasChanged = false
    for (const line of affectedLines) {
        const newMarker = buildHighlightMarkerForLine(highlightId, newBound, line)
        const isUpdated = updateLineMarkers(newRecord, line, highlightId, newMarker)
        if (isUpdated)
            hasChanged = true
    }

    return hasChanged ? newRecord : startEndPosition
}

export function buildHighlightMarkerForLine(
    highlightId: string,
    newBound: HighlightBound,
    line: number
): HighlightLine | undefined {
    const start = newBound.lineStart
    const end = newBound.lineEnd

    if (line < start || line > end)
        return
    if (start === end)
        return {
            highlightId,
            startWord: newBound.startWord,
            endWord: newBound.endWord,
            entireLine: false
        }
    if (line === start)
        return {
            highlightId,
            startWord: newBound.startWord,
            entireLine: false
        }
    if (line === end)
        return {
            highlightId,
            endWord: newBound.endWord,
            entireLine: false
        }
    return {
        highlightId,
        entireLine: true
    }
}

export function areHighlightMarkersEqual(a?: HighlightLine, b?: HighlightLine): boolean {
    if (!a || !b)
        return a === b
    return a.highlightId === b.highlightId
        && a.startWord   === b.startWord
        && a.endWord     === b.endWord
        && a.entireLine  === b.entireLine
}

function updateLineMarkers(
    record: Record<number, HighlightLine[]>,
    line: number,
    highlightId: string,
    nextMarker?: HighlightLine
): boolean {
    const currentMarkers = record[line] || []
    const currentIndex = currentMarkers.findIndex(m => m.highlightId === highlightId)
    const currentMarker = currentIndex >= 0 ? currentMarkers[currentIndex] : undefined

    if (areHighlightMarkersEqual(currentMarker, nextMarker))
        return false
    if (!nextMarker && currentIndex === -1)
        return false

    let nextMarkers: HighlightLine[]

    if (!nextMarker)
        nextMarkers = currentMarkers.filter(m => m.highlightId !== highlightId)
    else {
        nextMarkers = [...currentMarkers]
        if (currentIndex >= 0)
            nextMarkers[currentIndex] = nextMarker
        else
            nextMarkers.push(nextMarker)
    }

    if (nextMarkers.length === 0)
        delete record[line]
    else
        record[line] = nextMarkers

    return true
}



function addRangeToSet(set: Set<number>, start: number, end: number) {
    const min = Math.min(start, end)
    const max = Math.max(start, end)
    for (let i = min; i <= max; i++)
        set.add(i)
}

function invalidMove(
    id: number,
    prevId: number,
    bounds: HighlightBound | undefined,
    drag: DragType,
    error: HighlightReducerError | null
) {

    const boundExist = !!bounds
    const sameWord = prevId===id
    const invalidRightMove = drag.handle==='right' && !!bounds && bounds.startWord>id
    const invalidLeftMove = drag.handle==='left' && !!bounds && bounds.endWord<id

    const errorExist = !!error
    const invalidLeftMoveError = errorExist && error?.highlightId===drag.highlightId && error.handle === 'left' && id <= error.maxId
    const invalidRightMoveError = errorExist && error?.highlightId===drag.highlightId && error.handle === 'right' && id >= error.maxId

    return !boundExist || sameWord || invalidRightMove || invalidLeftMove || invalidLeftMoveError || invalidRightMoveError
}

function copyRecordWithoutHighlight(oldRecord: Record<number, HighlightLine[]>, highlightId: string): Record<number, HighlightLine[]> {
    const newRecord: Record<number, HighlightLine[]> = {}
    for (const [line, markers] of Object.entries(oldRecord)) {
        const lineIndex = parseInt(line, 10)
        const filteredMarkers = markers.filter(m => m.highlightId !== highlightId)
        if (filteredMarkers.length > 0)
                newRecord[lineIndex] = filteredMarkers
    }
    return newRecord
}

function checkOverlap(
    record: Record<number, HighlightLine[]>,
    newEnd: number,
    id: number,
    drag: DragType,
    highlightBounds: HighlightBound
):{isValid:boolean, error?: HighlightReducerError} {
    for (const [line, markers] of Object.entries(record)) {
        const lineIndex = parseInt(line)
        for (const m of markers) {
            const isHighlight=m.highlightId===drag.highlightId

            if( newEnd>= lineIndex &&
                !isHighlight &&
                drag.handle==='right' &&
                m.startWord !== undefined &&
                id>=m.startWord &&
                highlightBounds.startWord<=m.startWord
            ) {
                return {
                    isValid:false,
                    error:{
                        code: "INVALID_RIGHT_HANDLE_SPAN",
                        message: 'La maniglia non può essere spostata in quella posizione',
                        maxId:m.startWord-1,
                        handle: 'right',
                        highlightId:drag.highlightId
                    }
                }
            }else if(
                newEnd<= lineIndex &&
                !isHighlight &&
                drag.handle==='left' &&
                m.endWord !== undefined &&
                id<=m.endWord &&
                highlightBounds.endWord>=m.endWord
            ) {
                return {
                    isValid:false,
                    error:{
                        code:"INVALID_LEFT_HANDLE_SPAN",
                        message:'La maniglia non può essere spostata in quella posizione',
                        maxId:m.endWord+1,
                        handle:'left',
                        highlightId:drag.highlightId
                    }
                }
            }

        }
    }

    return {isValid: true}
}
