import {Suspense, useEffect} from "react";
import DoubleEditorSkeleton from "@/features/editor/components/skeleton/doubleEditorSkeleton.tsx";
import useScrollDynamic from "@/features/editor/hooks/useScrollDynamic.ts";
import {useStaticBiblicalTextRead} from "@/features/editor/hooks/useTextRead.ts";
import {highlightStore, HighlightStoreProvider} from "@/features/editor/store/highlightStore.tsx";
import {SelectionStoreProvider} from "@/features/editor/store/selectionStore.tsx";
import {HighlightDouble} from "@/features/double-editor/components/doubleEditor.tsx";
import useSyncHighlights from "@/features/double-editor/hook/useSyncHighlights.ts";
import HighlightEditorWindow from "@/features/editor/components/highlightEditorWindow.tsx";
import AccuracyError from "@/components/ui/common/accuracyError.tsx";
import {createTextConfig, UrlPath} from "@/features/editor/lib/utils.ts";

type Props = {
    urn: string
    start?: number,
    end?: number
}

const SingleViewReadOnlyBiblical=(props: Props)=> (
    <Suspense fallback={<DoubleEditorSkeleton/>}>
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

    const urlBiblical: UrlPath = {
        filename: filename!,
        path: path,
        scrollLine: Number(line)
    }

    const scrollBiblicalHook = useScrollDynamic()
    const initStore = highlightStore(state => state.init)
    const {text, id} = useStaticBiblicalTextRead(urlBiblical, line)

    const {
        selectedText: selectedText,
        listText: listText,
        range: hr
    } = createTextConfig(urlBiblical, id!, text.data, start, end, line)

    const previewHighlight: Record<string, HighlightDouble> = {
        "preview-highlight": {
            color: "1",
            historical: {
                startWord: 0,
                endWord: 0
            },
            biblical: hr
        }
    }

    useEffect(() => {
        initStore(previewHighlight, null, text.data.index)
    }, [previewHighlight, text.data.index])

    const globalHighlight = useSyncHighlights()
    const scroll = {selfScroll: scrollBiblicalHook}

    return (
        <div className={"relative h-full w-full"}>
            <HighlightEditorWindow
                mode={"readonly"}
                side={"biblical"}
                offset={text.data.startIndex ?? 0}
                text={{
                    ...text.data,
                    listOfText: listText
                }}
                chapterIndex={text.data.chapter}
                selectedText={selectedText}
                scroll={scroll}
                globalHighlight={globalHighlight}
            />
            <AccuracyError
                hasStart={!!start}
                hasEnd={!!end}
            />
        </div>
    )
}

export default SingleViewReadOnlyBiblical
