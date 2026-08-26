import HighlightEditorWindow from "@/components/editor/highlightEditorWindow.tsx";
import useSyncHighlights from "@/hooks/useSyncHighlights.ts";
import PreviewCardCostume from "@/components/editor/previewCard/previewCardCostume.tsx";
import {useEffect, useRef, useState, useMemo} from "react";
import {Popover} from "@base-ui/react/popover";
import {EditorTextType} from "@/components/page/editorPage.tsx";
import {AlertDialog} from "@base-ui/react/alert-dialog";
import {TextSelectedType} from "@/hooks/useTextNameSelection.ts";
import {useSearchParams} from "react-router";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {urlToPath} from "@/utils/util.ts";
import useScrollDynamic from "@/hooks/useScrollDynamic.ts";
import useInitSearchElement from "@/hooks/useSyncSelection.ts";
import {useHighlightStore} from "@/store/useHighlightStore.ts";
import AlertConfirmDialog from "@/components/common/alertConfirmDialog.tsx";

export type HighlightDouble = {
    color: string
    historical: HighlightSingle
    biblical: HighlightSingle
}

export type HighlightSingle = {
    startWord: number
    endWord: number
}
export type HighlightColor = {
    color: string
    position: HighlightSingle
}

type MultiHighlightFinalProps={
    highlightWords: Record<string, HighlightDouble>
    text: {
        biblical: EditorTextType
        historical: EditorTextType
    }
    selectedText: {
        biblical: TextSelectedType,
        historical: TextSelectedType
    }
    onTextChange: {
        biblical: (newSelected: TextSelectedType) => void
        historical: (newSelected: TextSelectedType) => void
    }
}

export default function DoubleEditor({
    highlightWords,
    text,
    selectedText,
    onTextChange = {biblical: () => {}, historical: () => {}},
}: MultiHighlightFinalProps) {

    const initStore = useHighlightStore(state => state.init)
    useInitSearchElement(selectedText.biblical, text.biblical.text)

    useEffect(() => {
        initStore(highlightWords, text.biblical.index, text.historical.index)
    }, [highlightWords, text.biblical.index, text.historical.index])

    const [searchParams] = useSearchParams()
    const globalState = useGlobalState()
    const globalHighlight = useSyncHighlights()

    const [idToDelete, setIdToDelete] = useState<string | null>(null)
    const deleteHandler = useRef(AlertDialog.createHandle())
    const blockSelectedRef = useRef<boolean>(false)
    const previewCardHandler = useRef(Popover.createHandle<string>())

    const scrollBiblicalHook = useScrollDynamic()
    const scrollHistoricalHook = useScrollDynamic()

    const scroll = {
        biblical: scrollBiblicalHook,
        historical: scrollHistoricalHook
    }

    const alert = useMemo(() => ({
        deleteHandler,
        setIdToDelete
    }), [])

    const scrollHistorical =  useMemo(()=>({
        selfScroll: scrollHistoricalHook,
        otherScroll: scrollBiblicalHook
    }), [scrollHistoricalHook, scrollBiblicalHook])

    const scrollBiblical = useMemo(() => ({
        selfScroll: scrollBiblicalHook,
        otherScroll: scrollHistoricalHook}
    ), [scrollBiblicalHook, scrollHistoricalHook])

    useEffect(() => {
        const searchB = searchParams.get('b')
        const searchH = searchParams.get('h')
        const searchBLine = searchParams.get('bline')
        const searchHLine = searchParams.get('hline')
        const urlParam = {
            biblical: urlToPath(searchB, searchBLine),
            historical: urlToPath(searchH, searchHLine)
        }

        if (globalState.state.editor?.linePos !== undefined) {
            if (globalState.state.editor.linePos.biblical !== 0)
                scrollBiblicalHook.setScroll({lineIndex: globalState.state.editor.linePos.biblical, mode:'start'})
            if (globalState.state.editor.linePos.historical !== 0)
                scrollHistoricalHook.setScroll({lineIndex: globalState.state.editor.linePos.historical, mode:'start'})
        } else if (urlParam.biblical && urlParam.historical) {
            scrollBiblicalHook.setScroll({lineIndex: urlParam.biblical.scrollLine, mode:'start'})
            scrollHistoricalHook.setScroll({lineIndex: urlParam.historical.scrollLine, mode:'start'})
            globalState.editorRef.current.linePos = {
                biblical: urlParam.biblical.scrollLine,
                historical: urlParam.historical.scrollLine
            }
        }
        return () => {
            globalState.confirmExit()
        }
    }, [])

    return (
        <div className={"flex flex-row divide-x divide-gray-500 h-screen w-full"}>
            <HighlightEditorWindow
                mode={"editor"}
                text={text['historical']}
                chapterIndex={text.historical.chapter}
                selectedText={selectedText.historical}
                onTextChange={onTextChange.historical}
                globalHighlight={globalHighlight}
                side={"historical"}
                scroll={scrollHistorical}
                previewCardHandler={previewCardHandler}
                alert={alert}
                blockSelectedRef={blockSelectedRef}
            />
            <HighlightEditorWindow
                mode={"editor"}
                text={text['biblical']}
                chapterIndex={text.biblical.chapter}
                selectedText={selectedText.biblical}
                onTextChange={onTextChange.biblical}
                globalHighlight={globalHighlight}
                side={"biblical"}
                scroll={scrollBiblical}
                previewCardHandler={previewCardHandler}
                alert={alert}
                blockSelectedRef={blockSelectedRef}
            />

            <PreviewCardCostume
                oppositeScrolls={scroll}
                previewCardHandler={previewCardHandler}
                blockSelectedRef={blockSelectedRef}
                texts={text}
            />
            <AlertConfirmDialog
                handle={deleteHandler}
                title={"Cancellare l'evidenziazione"}
                description={"Attenzione! L'azione non sarà reversibile"}
                confirmText={"Cancella"}
                cancelText={"Annulla"}
                onConfirm={() => {
                    globalHighlight.deleteHighlight(idToDelete)
                }}
                onOpenChange={(open) => blockSelectedRef.current = open}
            />
        </div>
    )
}
