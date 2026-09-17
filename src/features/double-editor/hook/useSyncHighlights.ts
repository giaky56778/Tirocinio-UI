import {useCallback} from "react";
import {useHighlightStore, useHighlightStoreContext} from "@/features/editor/store/useHighlightStore.tsx";
import {useDeleteHighlightWords, useUpdateHighlightWords} from "@/features/double-editor/hook/useHighlightMutate.ts";

export type SyncHighlightsType = {
    save: (highlightId: string|number) => void
    changeColor: (highlightId: string, color: string) => void
    deleteHighlight: (highlightId: string|null) => void
}

export default function useSyncHighlights():SyncHighlightsType {
    const updateHighlightMutation = useUpdateHighlightWords()
    const deleteHighlightMutation = useDeleteHighlightWords()

    const setColor = useHighlightStore(state => state.setColor)
    const removeHighlight = useHighlightStore(state => state.removeHighlight)
    
    const store = useHighlightStoreContext()

    const privateSave = useCallback((highlightId: string|number, newColor?: string) => {
        const state = store.getState()

        updateHighlightMutation.mutate({
            id: highlightId,
            newHighlight: {
                color: newColor ?? state.colors[highlightId],
                historical: {
                    startLine: state.historical.highlightBounds[highlightId].lineStart,
                    startWord: state.historical.highlightBounds[highlightId].startWord,
                    endWord: state.historical.highlightBounds[highlightId].endWord
                },
                biblical: {
                    startLine: state.biblical.highlightBounds[highlightId].lineStart,
                    startWord: state.biblical.highlightBounds[highlightId].startWord,
                    endWord: state.biblical.highlightBounds[highlightId].endWord
                }
            }
        })

    }, [store, updateHighlightMutation])

    const save = useCallback((highlightId: string|number) => {
        privateSave(highlightId)
    }, [privateSave])

    const changeColor = useCallback((highlightId: string, color: string) => {
        setColor(highlightId, color)
        privateSave(highlightId, color)
    }, [setColor, privateSave])

    const deleteHighlight = useCallback((highlightId: string|null) => {
        if(!highlightId)
            return

        removeHighlight(highlightId)
        deleteHighlightMutation.mutate(highlightId)
    }, [removeHighlight, deleteHighlightMutation])

    return {
        save,
        changeColor,
        deleteHighlight
    }
}
