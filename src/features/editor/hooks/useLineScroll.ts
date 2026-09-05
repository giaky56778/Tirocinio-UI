import {useCallback, useEffect, useMemo, useRef} from "react";
import {useSearchParams} from "react-router";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {TextType} from "@/utils/settings.ts";
import {ModeType} from "@/features/editor/components/highlightEditorWindow.tsx";
import {ScrollType} from "@/features/editor/hooks/useScrollDynamic.ts";

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
    const isInit = useRef(globalState.initPage.getIsInitialMount(page))

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

    const lineRef = useRef<number>(
        isInit.current && searchParams.has(paramKey)
            ? parseInt(searchParams.get(paramKey)!)
            : page==='editor' || page==='search'
                ? globalState.swapPage.getSelectedText(page, side)?.linePos ?? 0
                : 0
    )

    useEffect(() => {
        globalState.initPage.consumeInitialMount(page)
    }, [page, globalState])

    const handleLineScroll = useCallback((line: number) => {
        lineRef.current = line
        
        if (page === 'editor' && globalState.swapPage.editorRef.current) {
            if (!globalState.swapPage.editorRef.current.linePos)
                globalState.swapPage.editorRef.current.linePos = {
                    historical: 0,
                    biblical: 0
            }

            globalState.swapPage.editorRef.current.linePos[side] = line
        } else if (page === 'search' && globalState.swapPage.searchRef.current)
            globalState.swapPage.searchRef.current.linePos = line

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
