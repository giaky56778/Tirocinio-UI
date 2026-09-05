import {Suspense, useEffect} from "react";
import {highlightStore, HighlightStoreProvider} from "@/features/editor/store/highlightStore.tsx";
import {SelectionStoreProvider} from "@/features/editor/store/selectionStore.tsx";
import {SearchElementType} from "@/features/editor/reducer/selectionReducer.ts";
import {EditorTextType} from "@/features/double-editor/page/editorPage.tsx";
import ViewHighlightsSkeleton from "@/features/view/components/skeleton/viewHighlightsSkeleton.tsx";
import useScrollDynamic from "@/features/editor/hooks/useScrollDynamic.ts";
import {HighlightDouble} from "@/features/double-editor/components/doubleEditor.tsx";
import useSyncHighlights from "@/features/double-editor/hook/useSyncHighlights.ts";
import HighlightEditorWindow from "@/features/editor/components/highlightEditorWindow.tsx";
import {LINE_EXTRACT_LOWER} from "@/utils/settings.ts";
import {RangeHighlight} from "@/api/indexType.ts";
import {UrlPath} from "@/features/editor/lib/utils.ts";
import {useStaticTextRead} from "@/features/editor/hooks/useStaticTextRead.ts";

type Props = {
    bLine: number
    bSearch: SearchElementType
    h: string
    b_range?: RangeHighlight
    h_range?: RangeHighlight
    historicalText: EditorTextType
    bOffset?: number
}

const DoubleResultViewReadOnly=(props: Props) => (
    <Suspense fallback={<ViewHighlightsSkeleton/>}>
        <HighlightStoreProvider>
            <SelectionStoreProvider>
                <MiniEditorPageContent {...props}/>
            </SelectionStoreProvider>
        </HighlightStoreProvider>
    </Suspense>
)

function MiniEditorPageContent({bLine, bSearch, h, b_range, h_range, historicalText, bOffset}: Props) {
    const urlHistorical:UrlPath={
        filename:bSearch.filename,
        path:bSearch.path,
        scrollLine:bLine
    }

    const [rest, line] = h.split(":")
    const parts = rest.split(".")
    const filename = parts.pop()
    const path = parts.join(".")

    const urlBiblical:UrlPath = {
        filename:filename!,
        path:path,
        scrollLine:Number(line)
    }

    const scrollHistoricalHook = useScrollDynamic()
    const scrollBiblicalHook = useScrollDynamic()

    const staticText = useStaticTextRead({
        idHistorical: bSearch.id,
        historicalLine: bLine,
        urlBiblical: urlBiblical
    })

    const biblicalListText = [{
        path: urlBiblical.path,
        items: [{id: staticText.idBiblical, filename: urlBiblical.filename}]
    }]

    const previewHighlight = (() => {
        const result: Record<string, HighlightDouble> = {}
        if (!b_range || !h_range)
            return result

        result["preview-highlight"] = {
            color: "1",
            historical: b_range,
            biblical: h_range
        }
        return result
    })()

    const mergedHighlights:Record<string,HighlightDouble> = previewHighlight ? {
        ...staticText.highlightWordsQuery.data,
        ...previewHighlight
    } : {...staticText.highlightWordsQuery.data}

    const initStore = highlightStore(state => state.init)

    useEffect(() => {
        initStore(mergedHighlights, historicalText.index, staticText.biblicalTextQuery.data.index)
    }, [mergedHighlights, historicalText.index, staticText.biblicalTextQuery.data.index])

    const globalHighlight = useSyncHighlights()

    return (
        <div className={"flex flex-row divide-x divide-gray-500 h-screen w-full"}>
            <HighlightEditorWindow
                mode={"doubleReadonly"}
                side={"biblical"}
                offset={staticText.biblicalTextQuery.data.startIndex ?? 0}
                text={{
                    ...staticText.biblicalTextQuery.data,
                    listOfText: biblicalListText
                }}
                chapterIndex={staticText.biblicalTextQuery.data.chapter}
                selectedText={{
                    path: urlBiblical.path,
                    items: {id: staticText.idBiblical!, filename: urlBiblical.filename}
                }}
                globalHighlight={globalHighlight}
                scroll={{selfScroll: scrollBiblicalHook, otherScroll: scrollHistoricalHook}}
            />
            <HighlightEditorWindow
                mode={"doubleReadonly"}
                side={"historical"}
                offset={bOffset ?? Math.max(0, bLine - LINE_EXTRACT_LOWER + 1)}
                text={historicalText}
                chapterIndex={historicalText.chapter}
                selectedText={{
                    path: urlHistorical.path,
                    items: {id: bSearch.id, filename: urlHistorical.filename}
                }}
                globalHighlight={globalHighlight}
                scroll={{selfScroll: scrollHistoricalHook, otherScroll: scrollBiblicalHook}}
            />
        </div>
    )
}

export default DoubleResultViewReadOnly

