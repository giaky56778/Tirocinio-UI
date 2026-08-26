import {Suspense, useEffect, useMemo} from "react";
import EditorWindowSkeleton from "@/components/skeleton/editorWindowSkeleton.tsx";
import useScrollDynamic from "@/hooks/useScrollDynamic.ts";
import {UrlPath} from "@/components/page/editorPage.tsx";
import {useStaticHistoricalTextRead} from "@/hooks/useTextRead.ts";
import {highlightRange} from "@/utils/util.ts";
import {useHighlightStore, HighlightStoreProvider} from "@/store/useHighlightStore.ts";
import {SelectionStoreProvider} from "@/store/useSelectionStore.ts";
import {HighlightDouble} from "@/components/editor/doubleEditor.tsx";
import useSyncHighlights from "@/hooks/useSyncHighlights.ts";
import HighlightEditorWindow from "@/components/editor/highlightEditorWindow.tsx";

type Props = {
    urn: string
    start?: number,
    end?: number
}

const SingleViewReadOnlyHistorical=(props: Props)=> (
    <Suspense fallback={<EditorWindowSkeleton/>}>
        <HighlightStoreProvider>
            <SelectionStoreProvider>
                <MiniSingleEditorPageContent {...props}/>
            </SelectionStoreProvider>
        </HighlightStoreProvider>
    </Suspense>
)

function MiniSingleEditorPageContent({urn, start, end}: Props) {
    const [rest, line] = urn.split(":")
    const parts = rest.split(".")
    const filename = parts.pop()
    const path = parts.join(".")

    const urlHistorical: UrlPath = {
        filename: filename!,
        path: path,
        scrollLine: Number(line)
    }

    const scrollHistoricalHook = useScrollDynamic()
    const {text, id} = useStaticHistoricalTextRead(urlHistorical, line)

    const selectedText = {
        path: urlHistorical.path,
        items: {id: id!, filename: urlHistorical.filename}
    }

    const historicalListText = [{
        path: urlHistorical.path,
        items: [{id, filename: urlHistorical.filename}]
    }]

    const hr = useMemo(() => highlightRange({
        text: text.data,
        start,
        end
    }), [text.data, start, end])

    const offset=Number(Object.keys(text.data.index.content)[0])

    const previewHighlight = useMemo<Record<string, HighlightDouble>>(() => {
        return {
            "preview-highlight": {
                color: "1",
                biblical: hr ?? text.data.index.content[offset].start,
                historical: hr ?? text.data.index.content[offset].end
            }
        } as Record<string, HighlightDouble>
    }, [start, end, hr])

    console.log("previewHighlight",previewHighlight,text.data.index.content[offset])

    const initStore = useHighlightStore(state => state.init)
    useEffect(() => {
        initStore(previewHighlight, null, text.data.index)
    }, [previewHighlight, text.data.index])

    const globalHighlight = useSyncHighlights()
    const scroll = useMemo(() => ({selfScroll: scrollHistoricalHook}), [scrollHistoricalHook])

    console.log("historical",Number(Object.keys(text.data.index.content)[0]))
    return (
        <div className={"relative h-full w-full"}>
            <HighlightEditorWindow
                mode={"readonly"}
                side={"historical"}
                offset={Number(Object.keys(text.data.index.content)[0])-1}
                text={{
                    ...text.data,
                    listOfText: historicalListText
                }}
                chapterIndex={text.data.chapter}
                selectedText={selectedText}
                scroll={scroll}
                globalHighlight={globalHighlight}
            />
            {!(start && end) && (
                <div className={"absolute bottom-0 inset-x-0 z-10 bg-amber-50 border-t border-amber-200 px-3 py-1.5 text-center"}>
                    <span className="text-xs text-amber-800"> Attenzione! non è preciso a livello di parola, ma solo a quello di riga</span>
                </div>
            )}
        </div>

    )
}

export default SingleViewReadOnlyHistorical
