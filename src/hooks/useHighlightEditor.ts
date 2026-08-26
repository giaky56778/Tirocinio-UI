import React, {ActionDispatch,useRef, useState, useCallback, useMemo, useEffect} from "react";
import toast from "react-hot-toast";
import {useHighlightStore, useHighlightStoreContext} from "@/store/useHighlightStore.ts";
import usePointer, {PointerType} from "@/hooks/usePointer.ts";
import {actionType, stateType} from "@/components/reducer/wordHighlightReducer.ts";
import {colorMap, Side} from "@/utils/globalType.ts";
import {TextIndexSchema} from "@/utils/JSONSchema.ts";
import {SyncHighlightsType} from "@/hooks/useSyncHighlights.ts";
import useHighlightUI from "@/hooks/useHighlightUI.ts";

export type StateInteractiveType = {
    state:  stateType
    color: Record<string,string>
    action:ActionDispatch<[action: actionType]>
}

export type HighlightEditorType={
    state: StateInteractiveType
    toolBar: ToolBarType
    highlightState: HighlightStateType
    pointer: PointerType
}

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

type Props={
    syncAction: SyncHighlightsType
    side: Side
    indexPerLine: TextIndexSchema
    selectText:{
        onUpdateSelection:(currentWordId: { spanID: number | null; divID: number | null; spanFound?: number | null })=> void
        onClearSelection:()=> void
    }
    blockSelectedRef?: React.RefObject<boolean>
}

export default function useHighlightEditor({syncAction,indexPerLine,side,selectText, blockSelectedRef}:Props):HighlightEditorType {

    const {selectHandle, deselectHandle, whichIsPressed, lastPressedHandle}=useHighlightUI()

    const state = useHighlightStore(state => state[side])
    const color = useHighlightStore(state => state.colors)
    const dispatch = useHighlightStore(state => state.dispatch)
    const setSideToModify = useHighlightStore(state => state.setSideToModify)
    const sideToModify = useHighlightStore(state => state.sideToModify)

    const [isVisible, setToolBar] = useState<boolean>(false)
    const [highlightToModify, setHighlightToModify] = useState<string|null>(null)
    const snapshot = useRef<stateType>(null)
    const highlightToModifyRef = useRef<string|null>(null)
    highlightToModifyRef.current = highlightToModify

    const update = useCallback((wordId:number|null) => {
        const handle = whichIsPressed()
        if (handle == null || highlightToModifyRef.current == null || wordId === null)
            return

        dispatch(side,{
            type: "UPDATE_HIGHLIGHT",
            payload: {
                id: wordId,
                drag: {highlightId: highlightToModifyRef.current, handle},
                indexPerLine: indexPerLine
            }
        })
    }, [whichIsPressed])

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

    const pointer= usePointer({
        highlightState: {
            deselectHandle,
            update,
            whichIsPressed
        },
        selectText: selectText,
        blockSelectedRef
    })

    const setColorHighlight = useCallback((highlightId: string|null, color: string) => {
        if(highlightId==null || colorMap[color]==null)
            return

        syncAction.changeColor(highlightId,color)
    }, [syncAction.changeColor])

    const closeToolBarCaller = useCallback(() => {
        setHighlightToModify(null)
        setToolBar(false)
        setSideToModify(null)
    }, [setSideToModify])

    const store = useHighlightStoreContext()

    const showToolBarCaller = useCallback((highlightId: string|null) => {
        snapshot.current = store.getState()[side]
        setSideToModify(side)
        setHighlightToModify(highlightId)
        setToolBar(true)
    }, [setSideToModify, side, store])

    const saveCaller = useCallback(() => {
        if(sideToModify!==side || highlightToModifyRef.current==null)
            return

        syncAction.save(highlightToModifyRef.current)
        closeToolBarCaller()
    }, [sideToModify, side, syncAction.save, closeToolBarCaller])

    const restoreCaller = useCallback(() => {
        if(snapshot.current==null)
            return
        if(sideToModify!==side)
            return

        console.log(snapshot)
       dispatch(side,{
            type:"RESTORE",
            payload:{
                prevState:snapshot.current
            }
        })
        closeToolBarCaller()
        toast.success('Ripristinato con successo')
    }, [sideToModify, side, closeToolBarCaller])

    const toolBar = useMemo(() => ({
        toolBarVisibile: isVisible,
        save: saveCaller,
        restore: restoreCaller,
    }), [isVisible, saveCaller, restoreCaller])

    const highlightState = useMemo(() => ({
        editMode: isVisible,
        selectHandle,
        highlightToModify,
        setColorHighlight,
        showToolBar: showToolBarCaller,
        lastPressedHandle,
    }), [isVisible, selectHandle, highlightToModify, setColorHighlight, showToolBarCaller, lastPressedHandle])

    return {
        state: {
            state,
            color,
            action:(action)=>dispatch(side,action)
        },
        toolBar,
        highlightState,
        pointer: pointer
    }
}
