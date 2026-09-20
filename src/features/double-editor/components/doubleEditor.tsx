import {useEffect} from 'react';
import {AlertDialog} from "@base-ui/react/alert-dialog";
import {Popover} from "@base-ui/react/popover";
import HighlightEditorWindow from "@/features/editor/components/highlightEditorWindow.tsx";
import useSyncHighlights from "@/features/double-editor/hook/useSyncHighlights.ts";
import PreviewCardCustom from "@/features/double-editor/preview-card/previewCardCustom.tsx";
import type {EditorTextType} from "@/features/double-editor/editorPage.tsx";
import type {TextSelectedType} from "@/hook/useTextNameSelection.ts";
import useScrollDynamic from "@/features/editor/hooks/useScrollDynamic.ts";
import {useHighlightStore} from "@/features/editor/store/useHighlightStore.tsx";
import {useSelectionStore} from "@/features/editor/store/useSelectionStore.tsx";
import AlertConfirmDialog from "@/components/ui/common/alertConfirmDialog.tsx";
import type {AlertModifyPayloadType} from "@/features/search/components/search/alertModifySearch.tsx";

export type HighlightDouble = {
    color: string
    biblical: HighlightSingle
    historical: HighlightSingle
}

export type HighlightSingle = {
    startWord: number
    endWord: number
}
export type HighlightColor = {
    color: string
    position: HighlightSingle
}

export type TextOperationType={
    select:(newSelected: TextSelectedType)=> void
    delete: (id: number) => void
}

type Props={
    highlightWords: Record<string, HighlightDouble>
    text: {
        historical: EditorTextType
        biblical: EditorTextType
    }
    selectedText: {
        historical: TextSelectedType,
        biblical: TextSelectedType
    }
    textOp: {
        historical: TextOperationType
        biblical: TextOperationType
    }
}

export default function DoubleEditor({
    highlightWords,
    text,
    selectedText,
    textOp
}: Props) {

    const initStore = useHighlightStore(state => state.init)

    useEffect(() => {
        initStore(highlightWords, text.historical.index, text.biblical.index)
    }, [highlightWords, text.historical.index, text.biblical.index, initStore])

    const globalHighlight = useSyncHighlights()

    const deleteHandler = AlertDialog.createHandle<AlertModifyPayloadType>()
    const previewCardHandler = Popover.createHandle<string>()
    const setSelectionBlocked = useSelectionStore(s => s.setSelectionBlocked)

    const scrollHistoricalHook = useScrollDynamic()
    const scrollBiblicalHook = useScrollDynamic()

    const scroll = {
        historical: scrollHistoricalHook,
        biblical: scrollBiblicalHook
    }

    return (
        <>
            <div className={"flex flex-row divide-x divide-gray-500 h-screen w-full"}>
                <HighlightEditorWindow
                    key={`biblical-${selectedText.biblical.items.id}`}
                    mode={"editor"}
                    text={text['biblical']}
                    chapterIndex={text.biblical.chapter}
                    textOp={textOp.biblical}
                    selectedText={selectedText.biblical}
                    globalHighlight={globalHighlight}
                    side={"biblical"}
                    scroll={{
                        selfScroll: scrollBiblicalHook,
                        otherScroll: scrollHistoricalHook
                    }}
                    previewCardHandler={previewCardHandler}
                    alertDeleteHandler={deleteHandler}
                />
                <HighlightEditorWindow
                    key={`historical-${selectedText.historical.items.id}`}
                    mode={"editor"}
                    text={text['historical']}
                    chapterIndex={text.historical.chapter}
                    selectedText={selectedText.historical}
                    textOp={textOp.historical}
                    globalHighlight={globalHighlight}
                    side={"historical"}
                    scroll={{
                        selfScroll: scrollHistoricalHook,
                        otherScroll: scrollBiblicalHook
                    }}
                    previewCardHandler={previewCardHandler}
                    alertDeleteHandler={deleteHandler}
                />

                
            </div>
            <PreviewCardCustom
                oppositeScrolls={scroll}
                previewCardHandler={previewCardHandler}
                texts={text}
            />
            <AlertConfirmDialog
                handle={deleteHandler}
                title={"Cancellare l'evidenziazione"}
                description={"Attenzione! L'azione non sarà reversibile"}
                confirmText={"Cancella"}
                cancelText={"Annulla"}
                onOpenChange={(open:boolean) => setSelectionBlocked(open)}
            />
        </>
    )
}
