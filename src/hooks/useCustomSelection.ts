import React, {useCallback, useRef, useMemo, useEffect} from 'react';
import toast from "react-hot-toast";
import {copyHighlightText, copyHighlightTextFromID, findLineIdByWordId} from "@/utils/util.ts";
import {HighlightBound} from "@/components/reducer/wordHighlightReducer.ts";
import {SelectionOpType, SelectionPerSide, SelectionRange} from "@/components/reducer/selectionReducer.ts";
import {TextSelectedType} from "@/hooks/useTextNameSelection.ts";
import { useSelectionStore } from '@/store/useSelectionStore.ts';
import {useLocation, useNavigate} from "react-router";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {TextIndexSchema, TextSchema} from "@/utils/JSONSchema.ts";
import {Side} from "@/utils/globalType.ts";

export type UseCustomSelectionReturn = {
    selectedRange: SelectionRange
    selectedRangePerLine: SelectionPerSide
    selectionOp: SelectionOpType,
    copyWithKeyboard: (e: React.KeyboardEvent<HTMLDivElement>) => void
}

const copySuccess= "Testo copiato con successo"
const copyError = "Errore durante la copia"

type LocalProps = {
    side: Side
    text: TextSchema
    index: TextIndexSchema
    selectedText: TextSelectedType
}

export default function useCustomSelection({ side, text, index, selectedText }: LocalProps): UseCustomSelectionReturn {
    const selectionState = useSelectionStore(state => state.selectionState)
    const dispatch = useSelectionStore(state => state.dispatchSelection)
    const clearSelection = useSelectionStore(state => state.clearSelection)
    const setSearchElement = useSelectionStore(state => state.setSearchElement)
    
    const location = useLocation()
    const navigate = useNavigate()
    const globalState = useGlobalState()
    const selectionStartRef = useRef<number | null>(null)

    const isSelectingRef = useRef<boolean>(false)
    const lastSelectionEndRef = useRef<number | null>(null)
    const prevIdRef = useRef<number | null>(selectedText.items.id)

    const {selectedRange, selectedRangePerLine} = selectionState

    const handleClearSelection = useCallback(() => {
        isSelectingRef.current = false
        selectionStartRef.current = null
        lastSelectionEndRef.current = null
        clearSelection()
    }, [clearSelection])

    const handleUpdateSelection = useCallback((
        targetSide: Side,
        wordId: {
            spanID: number | null
            divID: number | null
            spanFound?: number | null
        }
    ) => {
        if (targetSide !== side || wordId.spanID == null)
            return

        window.getSelection()?.removeAllRanges()

        const prev = selectionStartRef.current
        const id = wordId.spanID

        if (prev == null) {
            selectionStartRef.current = id
            lastSelectionEndRef.current = id
            dispatch({
                type: "START_SELECTION",
                payload: { side, wordId: id, indexPerLine: index }
            })
            return
        }

        if (id !== lastSelectionEndRef.current) {
            lastSelectionEndRef.current = id
            dispatch({
                type: "UPDATE_SELECTION",
                payload: { side, startWordId: prev, endWordId: id, indexPerLine: index }
            })
        }
    }, [side, index, dispatch])

    const copyTextSelected = useCallback(async (e: React.KeyboardEvent<HTMLDivElement> | KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedRange && selectedRange.side === side) {
            e.preventDefault()

            const selectedTextResult = copyHighlightText({
                text: text,
                startWordId: selectedRange.start,
                endWordId: selectedRange.end
            })
            if (selectedTextResult) {
                try {
                    await navigator.clipboard.writeText(selectedTextResult)
                    toast.success(copySuccess)
                } catch (err) {
                    console.error(copyError, err)
                    toast.error(copyError)
                }
            }
        }
    }, [selectedRange, text, side])

    const search = useCallback(() => {
        if(selectedRange) {
            const textData = text
            if (textData) {
                const selectedTextResult = copyHighlightText({
                    text: textData,
                    startWordId: selectedRange.start,
                    endWordId: selectedRange.end
                })

                const path = selectedText.path
                const filename = selectedText.items.filename
                const id = selectedText.items.id

                if (!path || !filename || id == null)
                    return

                const res = findLineIdByWordId({text: index, wordId: selectedRange.start}) ?? 0
                if(location.pathname !== "/search") {
                    globalState.searchRef.current = {
                        ...globalState.searchRef.current,
                        searchElement:{
                            text: selectedTextResult,
                            path,
                            filename,
                            id,
                            selection: selectedRange
                        },
                        text: selectedText,
                        linePos: res
                    }
                    globalState.confirmExit()
                    navigate("/search")
                }

                setSearchElement({
                    text: selectedTextResult,
                    path,
                    filename,
                    id,
                    selection: selectedRange
                })
                handleClearSelection()
            }
        }
    }, [selectedRange, text, selectedText, index, handleClearSelection, location.pathname, navigate, globalState, setSearchElement])

    const copySelected = useCallback(async () => {
        if (!selectedRange) return
        const textData = text
        if (!textData) return
        try {
            const result = copyHighlightText({text: textData, startWordId: selectedRange.start, endWordId: selectedRange.end})
            await navigator.clipboard.writeText(result)
            toast.success(copySuccess)
        } catch (err) {
            console.error(copyError, err)
            toast.error(copyError)
        }
    }, [selectedRange, text])

    const copyHighlight = useCallback(async (highlightId: string | null, highlightBounds: Record<string, HighlightBound>, targetSide: Side) => {
        if (targetSide !== side)
            return
        const textData = text
        if (!textData)
            return
        try {
            const result = copyHighlightTextFromID({highlightBounds, highlightId, text: textData})
            await navigator.clipboard.writeText(result)
            toast.success(copySuccess)
        } catch (err) {
            console.error(copyError, err)
            toast.error(copyError)
        }
    }, [text, side])

    const resetSearchElement = useCallback(() => {
        setSearchElement(undefined)
        if (location.pathname === "/search") {
            globalState.searchRef.current.searchElement = undefined
        }
    }, [setSearchElement, location.pathname, globalState.searchRef])

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection()
            if (selection && selection.toString().trim().length > 0)
                handleClearSelection()
        }

        document.addEventListener("selectionchange", handleSelectionChange)

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange)
        }
    }, [handleClearSelection])

    useEffect(() => {
        if(prevIdRef.current !== selectedText.items.id) {
            prevIdRef.current = selectedText.items.id
            if (side === 'biblical')
                resetSearchElement()
            handleClearSelection()
        }
    }, [selectedText.items.id, handleClearSelection, resetSearchElement, side])

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            const nativeSel = window.getSelection()
            if (nativeSel && nativeSel.toString().length > 0)
                return
            void copyTextSelected(e)
        }
        window.addEventListener('keydown', listener)
        return () => window.removeEventListener('keydown', listener)
    }, [copyTextSelected])


    const selectionOp = useMemo(() => ({
        update: handleUpdateSelection,
        clear: handleClearSelection,
        search,
        copySelected,
        copyHighlight,
        resetSearchElement: resetSearchElement
    }), [handleUpdateSelection, handleClearSelection, search, copySelected, copyHighlight, resetSearchElement])

    return {
        selectedRange,
        selectedRangePerLine,
        selectionOp,
        copyWithKeyboard: copyTextSelected
    }
}
