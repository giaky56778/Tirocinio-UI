import {Suspense, useMemo, useEffect} from "react";
import {useHighlightStore, HighlightStoreProvider} from "@/store/useHighlightStore.ts";
import {SelectionStoreProvider} from "@/store/useSelectionStore.ts";
import {useStaticTextRead} from "@/hooks/useTextRead.ts";
import {SearchElementType} from "@/components/reducer/selectionReducer.ts";
import {EditorTextType, UrlPath} from "@/components/page/editorPage.tsx";
import ViewHighlightsSkeleton from "@/components/skeleton/viewHighlightsSkeleton.tsx";
import useScrollDynamic from "@/hooks/useScrollDynamic.ts";
import {HighlightDouble} from "@/components/editor/doubleEditor.tsx";
import useSyncHighlights from "@/hooks/useSyncHighlights.ts";
import HighlightEditorWindow from "@/components/editor/highlightEditorWindow.tsx";
import {LINE_EXTRACT_LOWER} from "@/utils/globalType.ts";

type Props = {
    bLine: number,
    bSearch: SearchElementType,
    h: string,
    b_range?: { startWord: number; endWord: number },
    h_range?: { startWord: number; endWord: number },
    biblicalText: EditorTextType,
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

function MiniEditorPageContent({bLine, bSearch, h, b_range, h_range, biblicalText, bOffset}: Props) {
    const urlBiblical:UrlPath={
        filename:bSearch.filename,
        path:bSearch.path,
        scrollLine:bLine
    }

    const [rest, line] = h.split(":")
    const parts = rest.split(".")
    const filename = parts.pop()
    const path = parts.join(".")

    const urlHistorical:UrlPath = {
        filename:filename!,
        path:path,
        scrollLine:Number(line)
    }

    const scrollBiblicalHook = useScrollDynamic()
    const scrollHistoricalHook = useScrollDynamic()

    const staticText = useStaticTextRead({
        idBiblical: bSearch.id,
        biblicalLine: bLine,
        urlHistorical: urlHistorical
    })

    const historicalListText = [{
        path: urlHistorical.path,
        items: [{id: staticText.idHistorical, filename: urlHistorical.filename}]
    }]

    const previewHighlight = useMemo<Record<string, HighlightDouble>>(() => {
        if (!b_range || !h_range)
            return {}

        const result:Record<string, HighlightDouble> = {}
        result["preview-highlight"] = {
            color: "1",
            biblical: b_range,
            historical: h_range
        }
        return result
    }, [b_range, h_range])

    const mergedHighlights = useMemo(() => ({
        ...staticText.highlightWordsQuery.data,
        ...previewHighlight
    }), [staticText.highlightWordsQuery.data, previewHighlight])

    const initStore = useHighlightStore(state => state.init)

    useEffect(() => {
        initStore(mergedHighlights, biblicalText.index, staticText.historicalTextQuery.data.index)
    }, [mergedHighlights, biblicalText.index, staticText.historicalTextQuery.data.index])

    const globalHighlight = useSyncHighlights()
    const offsetH=Number(Object.keys(staticText.historicalTextQuery.data.index.content)[0])


    return (
        <div className={"flex flex-row divide-x divide-gray-500 h-screen w-full"}>
            <HighlightEditorWindow
                mode={"doubleReadonly"}
                side={"historical"}
                offset={offsetH <=2 ? 0 : offsetH}
                text={{
                    ...staticText.historicalTextQuery.data,
                    listOfText: historicalListText
                }}
                chapterIndex={staticText.historicalTextQuery.data.chapter}
                selectedText={{
                    path: urlHistorical.path,
                    items: {id: staticText.idHistorical!, filename: urlHistorical.filename}
                }}
                globalHighlight={globalHighlight}
                scroll={{selfScroll: scrollHistoricalHook, otherScroll: scrollBiblicalHook}}
            />
            <HighlightEditorWindow
                mode={"doubleReadonly"}
                side={"biblical"}
                offset={bOffset ?? Math.max(0, bLine - LINE_EXTRACT_LOWER + 1)}
                text={biblicalText}
                chapterIndex={biblicalText.chapter}
                selectedText={{
                    path: urlBiblical.path,
                    items: {id: bSearch.id, filename: urlBiblical.filename}
                }}
                globalHighlight={globalHighlight}
                scroll={{selfScroll: scrollBiblicalHook, otherScroll: scrollHistoricalHook}}
            />
        </div>
    )
}

export default DoubleResultViewReadOnly

