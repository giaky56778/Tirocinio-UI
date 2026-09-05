import {Suspense, useEffect} from "react";
import {HighlightStoreProvider} from "@/features/editor/store/highlightStore.tsx";
import {SelectionStoreProvider} from "@/features/editor/store/selectionStore.tsx";
import ViewHighlightsSkeleton from "@/features/view/components/skeleton/viewHighlightsSkeleton.tsx";
import ErrorBoundary from "@/components/layout/errorBoundary.tsx";
import {ChapterIndexSchema, TextIndexSchema, TextListSchema, TextSchema} from "@/api/indexType.ts";
import DoubleEditor from "@/features/double-editor/components/doubleEditor.tsx";
import {LoadingSpinner} from "@/components/ui/icons";
import EditorWindowSkeleton from "@/features/editor/components/skeleton/editorWindowSkeleton.tsx";
import ForceUploadDialog from "@/features/upload-section/components/forceUploadDialog.tsx";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {useHighlightRead} from "@/features/double-editor/hook/useHighlightRead.ts";

export type EditorTextType={
    text: TextSchema,
    index: TextIndexSchema,
    chapter: ChapterIndexSchema,
    listOfText: TextListSchema
}

const EditorPage=()=> (
    <ErrorBoundary>
        <Suspense fallback={<ViewHighlightsSkeleton />}>
            <EditorPageContent />
        </Suspense>
    </ErrorBoundary>
)
function EditorPageContent() {

    const textState = useHighlightRead()
    const globalState = useGlobalState()
    useEffect(() => {
        return () => {
            globalState.swapPage.confirmExit()
        }
    }, [])

    const historicalSelectedText = textState.historical.selectedText
    const biblicalSelectedText = textState.biblical.selectedText

    const historicalTextBundle = textState.historical.textBundle.data
    const biblicalTextBundle = textState.biblical.textBundle.data
    const highlightWords = textState.highlightWords.data


    if (!historicalTextBundle && !historicalSelectedText)
        return(
            <>
                <EditorWindowSkeleton />
                <ForceUploadDialog selectText={textState.historical.setSelectedText} />
            </>
        )

    if (textState.isLoading || !historicalTextBundle || !biblicalTextBundle || !highlightWords || !historicalSelectedText || !biblicalSelectedText) {
        return <ViewHighlightsSkeleton/>

    }

    if (!biblicalSelectedText)
        throw new Error('Non ci sono testi biblici nel database')

    const isUpdating =
        textState.historical.textBundle.isFetching
        || textState.biblical.textBundle.isFetching
        || textState.highlightWords.isFetching


    const textSafeHistorical:EditorTextType = {
        text: historicalTextBundle.text,
        index: historicalTextBundle.index,
        chapter: historicalTextBundle.chapter,
        listOfText: textState.historical.textList.data ?? []
    }

    const textSafeBiblical:EditorTextType = {
        text: biblicalTextBundle.text,
        index: biblicalTextBundle.index,
        chapter: biblicalTextBundle.chapter,
        listOfText: textState.biblical.textList.data ?? []
    }

    const textSafe = {
        historical: textSafeHistorical,
        biblical: textSafeBiblical
    }

    return (
        <>
            {(isUpdating) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                    <LoadingSpinner className="size-6 text-orange-600"/>
                </div>
            )}
            <HighlightStoreProvider>
                <SelectionStoreProvider>
                    <DoubleEditor
                        highlightWords={highlightWords}
                        text={textSafe}
                        selectedText={{
                            historical: historicalSelectedText,
                            biblical: biblicalSelectedText,
                        }}
                        textOp={{
                            historical: {
                                select: textState.historical.setSelectedText,
                                delete: textState.historical.deleteText
                            },
                            biblical: {
                                select: textState.biblical.setSelectedText,
                                delete: textState.biblical.deleteText
                            }
                        }}
                    />
                </SelectionStoreProvider>
            </HighlightStoreProvider>
        </>
    )
}

export default EditorPage
