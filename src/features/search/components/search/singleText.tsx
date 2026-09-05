import HighlightEditorWindow, {
    SearchHighlightType
} from "@/features/editor/components/highlightEditorWindow.tsx";
import {EditorTextType} from "@/features/double-editor/page/editorPage.tsx";
import {TextSelectedType} from "@/hook/useTextNameSelection.ts";
import useScrollDynamic from "@/features/editor/hooks/useScrollDynamic.ts";
import {TextOperationType} from "@/features/double-editor/components/doubleEditor.tsx";
import {memo, useEffect, useMemo} from "react";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {useSearchParams} from "react-router";
import {findLineIdByWordId} from "@/utils/commonUtil.ts";
import {OFFSET_SCROLL} from "@/utils/settings.ts";

type Props={
    text: EditorTextType,
    selectedText: TextSelectedType,
    searchHighlight: SearchHighlightType,
    opTextHistorical: TextOperationType
}

function singleText({text, selectedText, searchHighlight, opTextHistorical}:Props){

    const scrollRight = useScrollDynamic()
    const globalState = useGlobalState()
    const [searchParams] = useSearchParams()
    const scroll = useMemo(() => ({selfScroll: scrollRight}), [scrollRight])

    useEffect(() => {
        const isHMatch = searchParams.has("h")
        const isStateMatch = globalState.swapPage.state.search?.text?.items.id === selectedText.items.id

        if (isStateMatch || isHMatch) {
            if (searchParams.has('start')) {
                const lineIndex = findLineIdByWordId({
                    text: text.index,
                    wordId: parseInt(searchParams.get('start')!)
                })
                if (lineIndex != undefined && (lineIndex - OFFSET_SCROLL) > 0) {
                    scrollRight.setScroll({lineIndex: lineIndex - OFFSET_SCROLL})
                }
            }
        }
    }, [])

    return (
        <HighlightEditorWindow
            key={`historical-${selectedText.items.id}`}
            mode="search"
            text={text}
            chapterIndex={text.chapter}
            selectedText={selectedText}
            scroll={scroll}
            searchHighlight={searchHighlight}
            side={'historical'}
            textOp={opTextHistorical}
        />
    )
}

export default memo(singleText)
