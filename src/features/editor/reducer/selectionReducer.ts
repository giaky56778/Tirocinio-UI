import {TextIndexSchema} from "@/api/indexType.ts";
import {
    areHighlightMarkersEqual,
    buildHighlightMarkerForLine,
    HighlightBound,
    HighlightLine,
    resolveLineByWordId
} from "@/features/editor/reducer/wordHighlightReducer.ts";
import {TextType} from "@/utils/settings.ts";

export type SelectionRange = {
    start: number
    end: number
    side: TextType
} | null

export type SearchHighlight = {
    start: number
    end: number
    side: TextType
    colorId: string
} | null

export type SelectionPerSide = {
    historical: Record<number, HighlightLine>
    biblical: Record<number, HighlightLine>
}

export type SearchElementType = {
    text: string
    id: number
    path: string
    filename: string
    selection: SelectionRange
}

export type SearchType = SearchElementType | undefined

type SelectionState = {
    selectedRange: SelectionRange;
    selectedRangePerLine: SelectionPerSide;
}

type SelectionAction = {
    type: "START_SELECTION"
    payload: {
        side: TextType
        wordId: number
        indexPerLine?: TextIndexSchema
    }
} | {
    type: "UPDATE_SELECTION"
    payload: {
        side: TextType
        startWordId: number
        endWordId: number
        indexPerLine?: TextIndexSchema
    }
} | {
    type: "CLEAR_SELECTION"
}

export const initialSelectionState: SelectionState = {
    selectedRange: null,
    selectedRangePerLine: {
        historical: {},
        biblical: {}
    }
}

export function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
    switch (action.type) {
        case "START_SELECTION": {
            const {side, wordId, indexPerLine} = action.payload
            const newRange: SelectionRange = {
                start: wordId,
                end: wordId,
                side
            }
            const oppositeSide=side === 'historical' ? 'biblical' : 'historical'

            const newSideRecord = updateSelectionRecord({}, null, newRange, indexPerLine)

            return {
                selectedRange: newRange,
                selectedRangePerLine: {
                    [side]: newSideRecord,
                    [oppositeSide]: {}
                } as SelectionPerSide
            }
        }
        case "UPDATE_SELECTION": {
            const { side, startWordId, endWordId, indexPerLine } = action.payload
            const newRange: SelectionRange = {
                start: Math.min(startWordId, endWordId),
                end: Math.max(startWordId, endWordId),
                side
            };
            const oppositeSide = side === 'historical' ? 'biblical' : 'historical'

            const prevSideRecord = state.selectedRangePerLine[side] ?? {}
            const newSideRecord = updateSelectionRecord(prevSideRecord, state.selectedRange, newRange, indexPerLine)

            return {
                selectedRange: newRange,
                selectedRangePerLine: {
                    [side]: newSideRecord,
                    [oppositeSide]: {}
                } as SelectionPerSide
            }
        }
        case "CLEAR_SELECTION": {
            return {
                selectedRange: null,
                selectedRangePerLine: {
                    historical: {},
                    biblical: {}
                }
            }
        }
        default:
            return state
    }
}


//---- Utility

function updateSelectionRecord(
    lineSelected: Record<number, HighlightLine>,
    prevRange: SelectionRange,
    newRange: NonNullable<SelectionRange>,
    indexPerLine: TextIndexSchema | undefined
): Record<number, HighlightLine> {

    if (!indexPerLine)
        return {}

    const newStartLine = resolveLineByWordId(indexPerLine, newRange.start)
    const newEndLine = resolveLineByWordId(indexPerLine, newRange.end)

    if (newStartLine === -1 || newEndLine === -1)
        return lineSelected

    const oldStartLine = (prevRange && prevRange.side === newRange.side)
        ? resolveLineByWordId(indexPerLine, prevRange.start)
        : newStartLine
    const oldEndLine = (prevRange && prevRange.side === newRange.side)
        ? resolveLineByWordId(indexPerLine, prevRange.end)
        : newEndLine

    const affectedLines = new Set<number>()

    const minStart = Math.min(oldStartLine, newStartLine)
    const maxStart = Math.max(oldStartLine, newStartLine)
    for (let i = minStart; i <= maxStart; i++)
        affectedLines.add(i)

    const minEnd = Math.min(oldEndLine, newEndLine)
    const maxEnd = Math.max(oldEndLine, newEndLine)
    for (let i = minEnd; i <= maxEnd; i++)
        affectedLines.add(i)

    const newLineSelected = { ...lineSelected }
    let changed = false

    const bound: HighlightBound = {
        startWord: newRange.start,
        endWord: newRange.end,
        lineStart: newStartLine,
        lineEnd: newEndLine
    }

    for (const line of affectedLines) {
        if (line < 0) continue
        const newMarker = buildHighlightMarkerForLine('selection', bound, line)
        const currentMarker = newLineSelected[line]

        if (areHighlightMarkersEqual(currentMarker, newMarker))
            continue

        if (!newMarker) {
            delete newLineSelected[line]
            changed = true
        } else {
            newLineSelected[line] = newMarker
            changed = true
        }
    }

    return changed ? newLineSelected : lineSelected
}