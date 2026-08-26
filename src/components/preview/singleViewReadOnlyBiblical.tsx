/*
import {Suspense, useMemo} from "react";
import {useStaticBiblicalTextRead} from "@/hooks/useTextRead.ts";
import {RowHighlight} from "@/hooks/useCustomSelection.ts";
import {highlightRange} from "@/utils/util.ts";
import {UrlPath} from "@/components/page/editorPage.tsx";
import EditorWindowSkeleton from "@/components/skeleton/editorWindowSkeleton.tsx";
import useScrollDynamic from "@/hooks/useScrollDynamic.ts";
import {HighlightDouble} from "@/components/editor/doubleEditor.tsx";
import useSyncHighlights from "@/hooks/useSyncHighlights.ts";
import HighlightEditorWindow from "@/components/editor/highlightEditorWindow.tsx";

type Props = {
    urn: string
    start?: number,
    end?: number
}

const SingleViewReadOnlyBiblical=(props: Props)=> (
    <Suspense fallback={<EditorWindowSkeleton/>}>
        <MiniSingleEditorPageContent {...props}/>
    </Suspense>
)

function MiniSingleEditorPageContent({urn, start, end}: Props){
    const [rest, line] = urn.split(":")
    const parts = rest.split(".")
    const filename = parts.pop()!
    const path = parts.join(".")

    const urlBiblical: UrlPath = {
        filename: filename!,
        path: path,
        scrollLine: -1 //Number(query.data.lineIndex)
    }

    const scrollBiblicalHook = useScrollDynamic()
    const {text, id} = useStaticBiblicalTextRead(urlBiblical, line, start)

    const selectedText = {
        path: urlBiblical.path,
        items: {id: id!, filename: urlBiblical.filename}
    }

    const historicalListText = [{
        path: urlBiblical.path,
        items: [{id: id!, filename: urlBiblical.filename}]
    }]

    const hr = useMemo(() => highlightRange({
        text: text.data,
        start,
        end
    }), [text.data, start, end])

    const rowHighlight: RowHighlight = {
        selectedRange: null,
        searchHighlight: null
    }

    const previewHighlight = useMemo<Record<string, HighlightDouble>>(() => {
        return {
            "preview-highlight": {
                color: "1",
                biblical: hr,
                historical: hr
            }
        } as Record<string, HighlightDouble>
    }, [start, end, hr])

    const globalHighlight = useSyncHighlights(previewHighlight)

    const scroll = useMemo(() => ({selfScroll: scrollBiblicalHook}), [scrollBiblicalHook])

    return (
        <div className={"relative h-full w-full"}>
            <HighlightEditorWindow
                mode={"readonly"}
                side={"biblical"}
                offset={Number(Object.keys(text.data.index.content)[0])-1}
                text={{
                    ...text.data,
                    listOfText: historicalListText
                }}
                chapterIndex={text.data.chapter}
                selectedText={selectedText}
                scroll={scroll}
                globalHighlight={globalHighlight}
                rowHighlight={rowHighlight}
            />
            {!(start && end) && (
                <div className={"absolute bottom-0 inset-x-0 z-10 bg-amber-50 border-t border-amber-200 px-3 py-1.5 text-center"}>
                    <span className="text-xs text-amber-800"> Attenzione! non è preciso a livello di parola, ma solo a quello di riga</span>
                </div>
            )}
        </div>

    )
}

export default SingleViewReadOnlyBiblical

 */
