import {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import toast from "react-hot-toast";
import {useHighlightStore, useHighlightStoreContext} from "@/features/editor/store/useHighlightStore.tsx";
import {type actionType, type stateType} from "@/features/editor/reducer/wordHighlightReducer.ts";
import {colorMap, type TextType} from "@/utils/settings.ts";
import {type SyncHighlightsType} from "@/features/double-editor/hook/useSyncHighlights.ts";
import {type TextIndexSchema} from "@/api/indexType.ts";

export type ToolBarType={
    toolBarVisibile:boolean
    save: ()=>void
    restore: ()=>void
}

export type HighlightStateType={
    editMode:boolean
    selectHandle:(handle:'left'|'right')=>void
    highlightToModify:string|null
    setColorHighlight:(highlightId: string | null, color: string)=>void
    showToolBar:(highlightId: string | null)=>void
    lastPressedHandle: 'left'|'right'|null
}


type EditorStateProps = {
    side: TextType
    globalHighlight: SyncHighlightsType
}

export function useEditorState({side, globalHighlight}: EditorStateProps) {
    const store = useHighlightStoreContext()
    const state = useHighlightStore(state => state[side])
    const color = useHighlightStore(state => state.colors)
    const dispatch = useHighlightStore(state => state.dispatch)
    const setSideToModify = useHighlightStore(state => state.setSideToModify)
    const sideToModify = useHighlightStore(state => state.sideToModify)

    const [isVisible, setToolBar] = useState<boolean>(false)
    const [highlightToModify, setHighlightToModify] = useState<string|null>(null)
    const snapshot = useRef<stateType | null>(null)

    const setColorHighlight = useCallback((highlightId: string|null, newColor: string) => {
        if(highlightId==null || colorMap[newColor]==null)
            return

        globalHighlight.changeColor(highlightId, newColor)
    }, [globalHighlight])

    const closeToolBarCaller = useCallback(() => {
        setHighlightToModify(null)
        setToolBar(false)
        setSideToModify(null)
    }, [setSideToModify])


    const showToolBarCaller = useCallback((highlightId: string|null) => {
        if(sideToModify != null) {
            if(sideToModify!==side) {
                toast.error('Modifica già in corso nel lato opposto', {
                    id: 'DIFFERENT_SIDE'
                })
            }
            if(sideToModify===side && highlightId!==highlightToModify) {
                toast.error('Modifica già in corso su un altro highlight', {
                    id: 'DIFFERENT_HIGHLIGHT'
                })
            }
            return
        }

        snapshot.current = store.getState()[side]
        setSideToModify(side)
        setHighlightToModify(highlightId)
        setToolBar(true)
    }, [sideToModify, store, side, setSideToModify, highlightToModify])

    const saveCaller = useCallback((currentHighlightToModify: string | null) => {
        if(sideToModify!==side || currentHighlightToModify==null)
            return

        globalHighlight.save(currentHighlightToModify)
        closeToolBarCaller()
    }, [sideToModify, side, globalHighlight, closeToolBarCaller])

    const restoreCaller = useCallback(() => {
        if(snapshot.current==null)
            return
        if(sideToModify!==side)
            return

       dispatch(side,{
            type:"RESTORE",
            payload:{
                prevState:snapshot.current
            }
        })
        closeToolBarCaller()
        toast.success('Ripristinato con successo')
    }, [sideToModify, side, closeToolBarCaller, dispatch])

    const updateHighlightBound = useCallback((wordId: number, handle: 'left' | 'right', textIndex: TextIndexSchema) => {
        if (highlightToModify == null) return
        dispatch(side, {
            type: "UPDATE_HIGHLIGHT",
            payload: {
                id: wordId,
                drag: {
                    highlightId: highlightToModify,
                    handle
                },
                indexPerLine: textIndex
            }
        })
    }, [dispatch, side, highlightToModify])

    useEffect(() => {
        const lastError = state.lastError
        if (lastError) {
            toast.error(lastError.message, {
                id: 'INVALID_HANDLE_SPAN'
            });
        } else {
            toast.dismiss('INVALID_HANDLE_SPAN');
        }
    }, [state.lastError])

    const toolBar = useMemo(() => ({
        toolBarVisibile: isVisible,
        save: () => saveCaller(highlightToModify),
        restore: restoreCaller,
    }), [isVisible, saveCaller, highlightToModify, restoreCaller])

    return {
        stateInteractive: {
            state,
            color,
            action: ((action: actionType) => dispatch(side, action))
        },
        toolBar,
        isVisible,
        highlightToModify,
        setColorHighlight,
        showToolBarCaller,
        updateHighlightBound
    }
}
