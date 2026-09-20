import {useEffect, useRef, useMemo, useCallback} from 'react';
import {useSearchParams} from "react-router";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {useGlobalState} from "@/store/globalStateStore.ts";
import {type TextType} from "@/utils/settings.ts";
import {type ModeType} from "@/features/editor/components/highlightEditorWindow.tsx";
import {type ScrollType} from "@/features/editor/hooks/useScrollDynamic.ts";

type UseLineScrollManagerProps = {
    page: ModeType,
    side: TextType,
    scroll?:ScrollType
}

export default function useLineScroll({page, side, scroll}: UseLineScrollManagerProps) {
    const [searchParams] = useSearchParams()
    const setBatchedParams = useBatchedSearchParams()
    const globalState = useGlobalState()
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isInitialMount = globalState.initPage.getIsInitialMount(page)

    const origin = useMemo(()=>{
        if(page==='editor')
            return '/'
        if(page==='search')
            return '/search'
        return
    },[page])
    const paramKey=useMemo(()=>{
        return side === 'historical' ? 'hline' : 'bline'
    },[side])

    const paramVal = searchParams.get(paramKey)
    const initialLine = isInitialMount && paramVal
        ? parseInt(paramVal, 10)
        : page === 'editor' || page === 'search'
            ? globalState.getSelectedText(page, side)?.linePos ?? 0
            : 0

    const lineRef = useRef<number>(initialLine)

    useEffect(() => {
        globalState.initPage.consumeInitialMount(page)
    }, [globalState.initPage, page])

    const handleLineScroll = useCallback((line: number) => {
        lineRef.current = line
        
        if (page === 'editor') {
            globalState.setEditor((prev) => ({
                linePos: {
                    ...prev.linePos,
                    historical: prev.linePos?.historical ?? 0,
                    biblical: prev.linePos?.biblical ?? 0,
                    [side]: line
                }
            }))
        } else if (page === 'search') {
            globalState.setSearch({ linePos: line })
        }

        if (debounceTimerRef.current)
            clearTimeout(debounceTimerRef.current)

        debounceTimerRef.current = setTimeout(() => {
            setBatchedParams({
                [paramKey]: String(line)
            }, origin)
        }, 400)
    }, [page, side, paramKey, origin, setBatchedParams, globalState])

    useEffect(() => {
        if((page ==='editor' || page==='search')) {
            setBatchedParams({
                [paramKey]: String(lineRef.current)
            }, origin)

            if (scroll && lineRef.current !== 0) {
                scroll.setScroll({ lineIndex: lineRef.current, mode: 'start' })
            }
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])

    return handleLineScroll
}
