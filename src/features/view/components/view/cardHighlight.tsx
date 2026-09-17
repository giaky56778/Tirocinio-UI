import type {TextSelectedType} from "@/hook/useTextNameSelection.ts";
import TextRender from "@/features/view/components/view/textRender.tsx";
import type {TextListSchema} from "@/api/indexType.ts";
import type {highlightBiblicalType, highlightTextType} from "@/features/view/api/viewApi.ts";
import useCardView from "@/features/view/hook/useCardView.ts";

export const HIGHLIGHT_CARD_CONTAINER_CLASS = "mb-4 rounded-xl border border-slate-200 bg-white shadow-2xs transition-shadow"
export const HIGHLIGHT_CARD_HEADER_CLASS = "flex items-center justify-between px-4 py-2.5 rounded-t-xl border-b border-orange-100 bg-orange-50/60"
export const HIGHLIGHT_CARD_BODY_CLASS = "p-4"
export const HIGHLIGHT_CARD_GRID_CLASS = "grid grid-cols-2 gap-4"
export const HIGHLIGHT_CARD_FOOTER_CLASS = "flex items-center justify-end px-4 py-2.5 rounded-b-xl border-t border-slate-100 bg-slate-50/50"

type Props={
    index: number
    selected: TextSelectedType | undefined
    highlight: highlightBiblicalType
    highlightData: highlightTextType[]
    showPage: number
    biblicalNames:TextListSchema
}

export default function CardHighlight({index,selected,highlight,highlightData,showPage,biblicalNames}:Props){

    const {historical,biblical,handleNavigateToHighlight} = useCardView({highlight, selected, highlightData, showPage, biblicalNames})

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
                    <TextRender
                        text={historical.text}
                        color={highlight.color_id}
                        side="biblical"
                        rowId={historical.firstLine}
                    />
                    <TextRender
                        text={biblical.text}
                        color={highlight.color_id}
                        side="historical"
                        rowId={biblical.firstLine}
                    />
                </div>
            </div>

            <footer className={HIGHLIGHT_CARD_FOOTER_CLASS}>
                <button
                    disabled={!selected}
                    onClick={handleNavigateToHighlight}
                    className="inline-flex items-center gap-2 bg-orange-700 hover:bg-orange-800 cursor-pointer transition-colors text-white px-3.5 py-1.5 rounded-lg shadow-2xs text-xs font-bold"
                >
                    Apri nell'Editor
                </button>
            </footer>
        </div>
    )
}