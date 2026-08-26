import {useEffect, useCallback, useMemo} from "react";
import {useSearchParams} from "react-router";
import {SettingsType, TooltipType} from "@/api";
import {useSelectionStore} from "@/store/useSelectionStore.ts";
import useInitSearchElement from "@/hooks/useSyncSelection.ts";
import {TextSelectedType} from "@/hooks/useTextNameSelection.ts";
import {useGlobalState} from "@/contexts/globalState.tsx";
import HighlightEditorWindow from "@/components/editor/highlightEditorWindow.tsx";
import {EditorTextType} from "@/components/page/editorPage.tsx";
import EditorWindowSkeleton from "@/components/skeleton/editorWindowSkeleton.tsx";
import SearchResultsSection from "@/components/search/searchResultsSection.tsx";
import {OFFSET_SCROLL, Side} from "@/utils/globalType.ts";
import {findLineIdByWordId} from "@/utils/util.ts";
import {ScrollType} from "@/hooks/useScrollDynamic.ts";

export type SearchHighlightType = {
    colorId: string
    start: number
    end: number
    side: Side
} | null

type Props = {
    settings: SettingsType,
    tooltip: TooltipType,
    text: EditorTextType,
    selectedText: TextSelectedType,
    scrollRight: ScrollType,
    setSelectedTextBiblical: (newSelected: TextSelectedType) => void,
    isLoading: boolean,
}

export default function SearchPageEditor({settings, tooltip, text, selectedText, scrollRight, setSelectedTextBiblical, isLoading}: Props) {

    const [searchParams] = useSearchParams()
    const globalState = useGlobalState()
    useInitSearchElement(selectedText, text.text)
    const searchElement = useSelectionStore(state => state.searchElement)
    const setSearchElement = useSelectionStore(state => state.setSearchElement)
    
    const resetSearchElement = useCallback(() => {
        setSearchElement(undefined)
    }, [setSearchElement])

    useEffect(() => {
        if(globalState.state.search?.linePos != null){
            scrollRight.setScroll({ lineIndex: globalState.state.search.linePos, mode:'start' })
        }else if(searchParams.has('start')){
            const lineIndex = findLineIdByWordId({
                text:text.index,
                wordId:parseInt(searchParams.get('start')!)
            })
            if(lineIndex != undefined){
                scrollRight.setScroll({ lineIndex: lineIndex - OFFSET_SCROLL })
            }
        } else if(searchParams.has('bline')){
            const lineIndex = parseInt(searchParams.get('bline')!)
            scrollRight.setScroll({ lineIndex: lineIndex, mode:'start' })
        }

        return () => {
            globalState.confirmExit()
        }
    }, [])

    const searchHighlight = useMemo(() => (
        searchElement?.selection
            ? {
                ...searchElement.selection,
                colorId: '3'
            } : null
    ), [searchElement])

    const scroll = useMemo(() => ({selfScroll: scrollRight}), [scrollRight])

    return (
        <div className={"flex flex-row divide-x divide-gray-500 h-screen w-full"}>
            <SearchResultsSection
                settings={settings}
                tooltip={tooltip}
                searchElement={searchElement}
                resetSearchElement={resetSearchElement}
                biblicalText={text}
                selectedText={selectedText}
            />
            {isLoading
                ?
                    <EditorWindowSkeleton/>
                : (
                    <HighlightEditorWindow
                        mode="search"
                        text={text}
                        chapterIndex={text.chapter}
                        selectedText={selectedText}
                        scroll={scroll}
                        searchHighlight={searchHighlight}
                        side={'biblical'}
                        onTextChange={setSelectedTextBiblical}
                    />
                )
            }
        </div>
    )
}
