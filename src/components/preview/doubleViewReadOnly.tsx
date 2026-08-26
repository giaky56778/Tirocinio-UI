import {Suspense, useEffect} from "react";
import {useHighlightStore, HighlightStoreProvider} from "@/store/useHighlightStore.ts";
import {SelectionStoreProvider} from "@/store/useSelectionStore.ts";
import {useStaticBiblicalTextRead, useStaticHistoricalTextRead} from "@/hooks/useTextRead.ts";
import {createTextConfig, parseUrn} from "@/utils/util.ts";
import useScrollDynamic from "@/hooks/useScrollDynamic.ts";
import {HighlightDouble} from "@/components/editor/doubleEditor.tsx";
import useSyncHighlights from "@/hooks/useSyncHighlights.ts";
import HighlightEditorWindow from "@/components/editor/highlightEditorWindow.tsx";
import ViewHighlightsSkeleton from "@/components/skeleton/viewHighlightsSkeleton.tsx";

type Props = {
    historical:{
        urn: string
        start?: number,
        end?: number
    },
    biblical: {
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

function MiniDoubleEditorPageContent({historical,biblical}: Props){
    const { url: urlHistorical, line: h_line } = parseUrn(historical.urn)
    const { url: urlBiblical, line: b_line } = parseUrn(biblical.urn)

    const scrollBiblicalHook = useScrollDynamic()
    const scrollHistoricalHook = useScrollDynamic()
    const {text:b_text, id:b_id} = useStaticBiblicalTextRead(urlBiblical, b_line, biblical.start)
    const {text: h_text, id: h_id} = useStaticHistoricalTextRead(urlHistorical, h_line, historical.start)

    const {
        selectedText: biblicalSelectedText,
        listText: biblicalListText,
        range: br
    } = createTextConfig(urlBiblical, b_id!, b_text.data, biblical.start, biblical.end, b_line)
    const {
        selectedText: historicalSelectedText,
        listText: historicalListText,
        range: hr
    } = createTextConfig(urlHistorical, h_id!, h_text.data, historical.start, historical.end, h_line)

    const previewHighlight: Record<string, HighlightDouble> = {
        "preview-highlight": {
            color: "1",
            biblical: br,
            historical: hr
        }
    }

    const initStore = useHighlightStore(state => state.init)
    
    useEffect(() => {
        initStore(previewHighlight, b_text.data.index, h_text.data.index)
    }, [previewHighlight, b_text.data.index, h_text.data.index])

    const globalHighlight = useSyncHighlights()
    const offsetH=Number(Object.keys(h_text.data.index.content)[0])
    const offsetB=Number(Object.keys(b_text.data.index.content)[0])

    return (
        <div className="grid grid-cols-2 divide-x divide-gray-500 min-h-0 overflow-hidden gap-0">
            <div className={"relative h-full w-full"}>
                <HighlightEditorWindow
                    mode={"readonly"}
                    side={"historical"}
                    offset={offsetH <=2 ? 0 : offsetH}
                    text={{
                        ...h_text.data,
                        listOfText: historicalListText
                    }}
                    chapterIndex={h_text.data.chapter}
                    selectedText={historicalSelectedText}
                    scroll={{selfScroll: scrollHistoricalHook}}
                    globalHighlight={globalHighlight}
                />
                {!(historical.start && historical.end) && (
                    <div className={"absolute bottom-0 inset-x-0 z-10 bg-amber-50 border-t border-amber-200 px-3 py-1.5 text-center"}>
                        <span className="text-xs text-amber-800"> Attenzione! non è preciso a livello di parola, ma solo a quello di riga</span>
                    </div>
                )}
            </div>
            <div className={"relative h-full w-full"}>
                <HighlightEditorWindow
                    mode={"readonly"}
                    side={"biblical"}
                    offset={offsetB <=2 ? 0 : offsetB}
                    text={{
                        ...b_text.data,
                        listOfText: biblicalListText
                    }}
                    chapterIndex={b_text.data.chapter}
                    selectedText={biblicalSelectedText}
                    scroll={{selfScroll: scrollBiblicalHook}}
                    globalHighlight={globalHighlight}
                />
                {!(biblical.start && biblical.end) && (
                    <div className={"absolute bottom-0 inset-x-0 z-10 bg-amber-50 border-t border-amber-200 px-3 py-1.5 text-center"}>
                        <span className="text-xs text-amber-800"> Attenzione! non è preciso a livello di parola, ma solo a quello di riga</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoubleViewReadOnly
