import {useCallback, useEffect, useMemo, useRef} from "react";
import {useSearchParams} from "react-router";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {Side} from "@/utils/globalType.ts";
import {ModeType} from "@/components/editor/highlightEditorWindow.tsx";

type UseLineScrollManagerProps = {
    page: ModeType,
    side: Side
}

export default function useLineScroll({page, side}: UseLineScrollManagerProps) {
    const [searchParams] = useSearchParams()
    const setBatchedParams = useBatchedSearchParams()
    const globalState = useGlobalState()
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const origin = useMemo(()=>{
        if(page==='editor')
            return '/'
        if(page==='search')
            return '/search'
        return
    },[page])
    const paramKey=useMemo(()=>{
        return side === 'biblical' ? 'bline' : 'hline'
    },[side])

    const lineRef = useRef<number>(
        searchParams.has(paramKey)
            ? parseInt(searchParams.get(paramKey)!)
            : page==='editor' || page==='search'
                ? globalState.getSelectedText(page, side)?.linePos ?? 0
                : 0
    )

    const handleLineScroll = useCallback((line: number) => {
        lineRef.current = line
        
        if (page === 'editor' && globalState.editorRef.current) {
            if (!globalState.editorRef.current.linePos)
                globalState.editorRef.current.linePos = {biblical: 0, historical: 0}

            globalState.editorRef.current.linePos[side] = line
        } else if (page === 'search' && globalState.searchRef.current)
            globalState.searchRef.current.linePos = line

        if (debounceTimerRef.current)
            clearTimeout(debounceTimerRef.current)

        debounceTimerRef.current = setTimeout(() => {
            setBatchedParams({
                [paramKey]: String(line)
            }, origin)
        }, 400)
    }, [page, side, paramKey, origin, setBatchedParams, globalState])

    useEffect(() => {
        if(!searchParams.has(paramKey)) {
            setBatchedParams({
                [paramKey]: String(lineRef.current),
            }, origin)
        }
    }, [searchParams, paramKey, setBatchedParams, origin])

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])

    return handleLineScroll
}
