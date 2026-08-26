import {showText} from "@/utils/util.ts";
import {TextSelectedType} from "@/hooks/useTextNameSelection.ts";
import {highlightHistoricalType, highlightTextType} from "@/api";
import TextRender from "@/components/view/textRender.tsx";
import {DocumentIcon} from "@/components/icons";
import {OFFSET_SCROLL} from "@/utils/globalType.ts";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {TextListSchema, TextSchema} from "@/utils/JSONSchema.ts";
import {useNavigate} from "react-router";

type Props={
    index: number
    selected: TextSelectedType | undefined
    highlight: highlightHistoricalType
    highlightData: highlightTextType[]
    showPage: number
    historicalNames:TextListSchema

}

export const HIGHLIGHT_CARD_CONTAINER_CLASS = "mb-4 rounded-xl border border-slate-200 bg-white shadow-2xs transition-shadow"
export const HIGHLIGHT_CARD_HEADER_CLASS = "flex items-center justify-between px-4 py-2.5 rounded-t-xl border-b border-orange-100 bg-orange-50/60"
export const HIGHLIGHT_CARD_BODY_CLASS = "p-4"
export const HIGHLIGHT_CARD_GRID_CLASS = "grid grid-cols-2 gap-4"
export const HIGHLIGHT_CARD_FOOTER_CLASS = "flex items-center justify-end px-4 py-2.5 rounded-b-xl border-t border-slate-100 bg-slate-50/50"

function getRowId(textLines: TextSchema) {
    for (let i = 0; i < textLines.length; i++) {
        const temp = textLines[i]
        if (temp.type === 'text') {
            const spl = temp.id.split('_')
            return spl[0] + ':' + spl[1]
        }
    }
    return ""
}

export default function CardHighlight({index,selected,highlight,highlightData,showPage,historicalNames}:Props){
    const canNavigate = !!selected;
    const textB = showText({
        limitWord: false,
        textLines: highlight.biblical_text,
        bound: {
            lineStart: 0,
            lineEnd: highlight.biblical_text.length - 1,
            startWord: highlight.biblical_range_word.startWord,
            endWord: highlight.biblical_range_word.endWord
        }
    })
    const textH = showText({
        limitWord: false,
        textLines: highlight.historical_text,
        bound: {
            lineStart: 0,
            lineEnd: highlight.historical_text.length - 1,
            startWord: highlight.historical_range_word.startWord,
            endWord: highlight.historical_range_word.endWord
        }
    })

    const rowB:string= getRowId(highlight.biblical_text)
    const rowH:string= getRowId(highlight.historical_text)

    const globalState=useGlobalState()
    const navigate=useNavigate()

    function handleNavigateToHighlight() {
        if (!selected || !highlightData)
            return
        const page = highlightData[showPage]
        if (!page)
            return

        const editorRef= globalState.editorRef.current

        const historicalGroup = historicalNames.find(g => g.path === page.path)
        const historicalItem = historicalGroup?.items.find(i => i.filename === page.filename)
        const historicalSelected = (historicalGroup && historicalItem)
            ? { path: historicalGroup.path, items: historicalItem }
            : { path: page.path, items: { id: 0, filename: page.filename } }

        editorRef.biblical = selected
        editorRef.historical = historicalSelected

        const linePos=globalState.editorRef.current.linePos
        if (linePos) {
            linePos.biblical = highlight.biblical_start_line - OFFSET_SCROLL
            linePos.historical = highlight.historical_start_line - OFFSET_SCROLL
        }

        globalState.viewRef.current.text = selected
        globalState.viewRef.current.page = showPage

        globalState.confirmExit()

        navigate('/')
    }

    return (
        <div
            key={index}
            className={HIGHLIGHT_CARD_CONTAINER_CLASS}
        >
            <header className={HIGHLIGHT_CARD_HEADER_CLASS}>
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0 text-xs font-bold rounded-full min-w-5.5 h-5.5 px-1.5 flex items-center justify-center bg-orange-600 text-white shadow-2xs">
                        {index + 1}
                    </span>
                </div>
            </header>

            <div className={HIGHLIGHT_CARD_BODY_CLASS}>
                <div className={HIGHLIGHT_CARD_GRID_CLASS}>
                    <TextRender text={textH} color={highlight.color_id} side="historical" rowId={rowH} />
                    <TextRender text={textB} color={highlight.color_id} side="biblical" rowId={rowB} />
                </div>
            </div>

            <footer className={HIGHLIGHT_CARD_FOOTER_CLASS}>
                <button
                    disabled={!canNavigate}
                    onClick={handleNavigateToHighlight}
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 cursor-pointer transition-colors text-white px-3.5 py-1.5 rounded-lg shadow-2xs text-xs font-medium"
                >
                    <DocumentIcon className="size-4 fill-orange-500 bg-white rounded-full p-0.5 shrink-0" />
                    <span>Apri nell'Editor</span>
                </button>
            </footer>
        </div>
    )
}