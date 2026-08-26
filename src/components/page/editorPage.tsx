import {Suspense} from "react";
import {useHighlightRead} from "@/hooks/useTextRead.ts";
import {HighlightStoreProvider} from "@/store/useHighlightStore.ts";
import {SelectionStoreProvider} from "@/store/useSelectionStore.ts";
import ViewHighlightsSkeleton from "@/components/skeleton/viewHighlightsSkeleton.tsx";
import ErrorBoundary from "@/components/errorBoundary.tsx";
import {ChapterIndexSchema, TextIndexSchema, TextListSchema, TextSchema} from "@/utils/JSONSchema.ts";
import DoubleEditor from "@/components/editor/doubleEditor.tsx";
import {LoadingSpinner} from "@/components/icons";
import EditorWindowSkeleton from "@/components/skeleton/editorWindowSkeleton.tsx";
import ForceUploadDialog from "@/components/forceUploadDialog.tsx";

export type UrlPath = {
    path: string
    filename: string
    scrollLine: number
}

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

    const biblicalSelectedText = textState.biblical.selectedText
    const historicalSelectedText = textState.historical.selectedText

    const biblicalTextBundle = textState.biblical.textBundle.data
    const historicalTextBundle = textState.historical.textBundle.data
    const highlightWords = textState.highlightWords.data

    if (textState.isLoading || !biblicalTextBundle || !historicalTextBundle || !highlightWords) {
        return <ViewHighlightsSkeleton/>
    }
    if (!biblicalSelectedText) {
        return(
            <>
                <EditorWindowSkeleton />
                <ForceUploadDialog selectText={textState.biblical.setSelectedText} />
            </>
        )
    }
    if (!historicalSelectedText) {
        throw new Error('There is no historical text available.');
    }

    const isUpdating =
        textState.biblical.textBundle.isFetching
        || textState.historical.textBundle.isFetching
        || textState.highlightWords.isFetching


    const textSafeBiblical:EditorTextType = {
        text: biblicalTextBundle.text,
        index: biblicalTextBundle.index,
        chapter: biblicalTextBundle.chapter,
        listOfText: textState.biblical.textList.data ?? []
    }

    const textSafeHistorical:EditorTextType = {
        text: historicalTextBundle.text,
        index: historicalTextBundle.index,
        chapter: historicalTextBundle.chapter,
        listOfText: textState.historical.textList.data ?? []
    }

    const textSafe = {
        biblical: textSafeBiblical,
        historical: textSafeHistorical
    }

    return (
        <>
            {(isUpdating) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                    <LoadingSpinner className="size-6 text-blue-600"/>
                </div>
            )}
            <HighlightStoreProvider>
                <SelectionStoreProvider>
                    <DoubleEditor
                        key={`${biblicalSelectedText.items.id}-${historicalSelectedText.items.id}`}
                        highlightWords={highlightWords}
                        text={textSafe}
                        selectedText={{
                            biblical: biblicalSelectedText,
                            historical: historicalSelectedText,
                        }}
                        onTextChange={{
                            biblical: textState.biblical.setSelectedText,
                            historical: textState.historical.setSelectedText,
                        }}
                    />
                </SelectionStoreProvider>
            </HighlightStoreProvider>
        </>
    )
}

export default EditorPage
