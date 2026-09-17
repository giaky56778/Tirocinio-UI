import {Suspense, useEffect} from "react";
import {useHighlightStore, HighlightStoreProvider} from "@/features/editor/store/useHighlightStore.tsx";
import {SelectionStoreProvider} from "@/features/editor/store/useSelectionStore.tsx";
import {useStaticBiblicalTextRead, useStaticHistoricalTextRead} from "@/features/editor/hooks/useTextRead.ts";
import useScrollDynamic from "@/features/editor/hooks/useScrollDynamic.ts";
import type {HighlightDouble} from "@/features/double-editor/components/doubleEditor.tsx";
import useSyncHighlights from "@/features/double-editor/hook/useSyncHighlights.ts";
import HighlightEditorWindow from "@/features/editor/components/highlightEditorWindow.tsx";
import ViewHighlightsSkeleton from "@/features/view/components/skeleton/viewHighlightsSkeleton.tsx";
import AccuracyError from "@/components/ui/common/accuracyError.tsx";
import {createTextConfig, parseUrn} from "@/features/editor/lib/utils.ts";

type Props = {
    biblical:{
        urn: string
        start?: number,
        end?: number
    },
    historical: {
        urn: string
        start?: number,
        end?: number
    }
}

const DoubleViewReadOnly=(props: Props)=> (
    <Suspense fallback={<ViewHighlightsSkeleton/>}>
        <HighlightStoreProvider>
            <SelectionStoreProvider>
                <MiniDoubleEditorPageContent {...props}/>
            </SelectionStoreProvider>
        </HighlightStoreProvider>
    </Suspense>
)

function MiniDoubleEditorPageContent({biblical,historical}: Props){
    const {url: urlHistorical, line: h_line } = parseUrn(historical.urn)
    const {url: urlBiblical, line: b_line } = parseUrn(biblical.urn)

    const scrollHistoricalHook = useScrollDynamic()
    const scrollBiblicalHook = useScrollDynamic()
    const {text:h_text, id:h_id} = useStaticHistoricalTextRead(urlHistorical, h_line, historical.start)
    const {text:b_text, id:b_id} = useStaticBiblicalTextRead(urlBiblical, b_line, biblical.start)

    const {
        selectedText: historicalSelectedText,
        listText: historicalListText,
        range: hr
    } = createTextConfig(urlHistorical, h_id!, h_text.data, historical.start, historical.end, h_line)
    const {
        selectedText: biblicalSelectedText,
        listText: biblicalListText,
        range: br
    } = createTextConfig(urlBiblical, b_id!, b_text.data, biblical.start, biblical.end, b_line)

    

    const initStore = useHighlightStore(state => state.init)

    useEffect(() => {
        const previewHighlight: Record<string, HighlightDouble> = {
            "preview-highlight": {
                color: "1",
                historical: hr,
                biblical: br
            }
        }
        initStore(previewHighlight, h_text.data.index, b_text.data.index)
    }, [b_text.data.index, br, h_text.data.index, hr, initStore])

    const globalHighlight = useSyncHighlights()

    return (
        <div className="grid grid-cols-2 divide-x divide-gray-500 min-h-0 overflow-hidden gap-0">
            <div className={"relative h-full w-full"}>
                <HighlightEditorWindow
                    mode={"readonly"}
                    side={"biblical"}
                    offset={(b_text.data.startIndex?? 0)}
                    text={{
                        ...b_text.data,
                        listOfText: biblicalListText
                    }}
                    chapterIndex={b_text.data.chapter}
                    selectedText={biblicalSelectedText}
                    scroll={{selfScroll: scrollBiblicalHook}}
                    globalHighlight={globalHighlight}
                />
                <AccuracyError
                    hasStart={biblical.start==undefined}
                    hasEnd={biblical.end==undefined}
                />
            </div>
            <div className={"relative h-full w-full"}>
                <HighlightEditorWindow
                    mode={"readonly"}
                    side={"historical"}
                    offset={(h_text.data.startIndex?? 0)}
                    text={{
                        ...h_text.data,
                        listOfText: historicalListText
                    }}
                    chapterIndex={h_text.data.chapter}
                    selectedText={historicalSelectedText}
                    scroll={{selfScroll: scrollHistoricalHook}}
                    globalHighlight={globalHighlight}
                />
                <AccuracyError
                    hasStart={historical.start==undefined}
                    hasEnd={historical.end==undefined}
                />
            </div>
        </div>
    )
}

export default DoubleViewReadOnly
