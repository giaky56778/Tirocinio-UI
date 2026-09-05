import {RefObject} from "react";
import {SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import {EditorTextType} from "@/features/double-editor/page/editorPage.tsx";
import {
    RESULT_CARD_BODY_CLASS,
    RESULT_CARD_CONTAINER_CLASS,
    RESULT_CARD_FOOTER_CLASS,
    AddNewHighlightObj
} from "@/features/search/components/search/resultOutput.tsx";
import {TEXT_FONT_CLASS} from "@/utils/settings.ts";
import {Tooltip} from "@base-ui/react/tooltip";
import PreviewSingle from "@/features/search/components/search/searchPreview/singleSearchPreview.tsx";
import PreviewDouble from "@/features/search/components/search/searchPreview/doubleSearchPreview.tsx";
import {SingleSearchType} from "@/features/search/api/searchApiType.ts";

type Props = {
    i: number,
    result: {
        item: SingleSearchType
        originalIndex: number
    },
    isDoubleMode: boolean,
    confirmedSearch?: SearchType,
    historicalText: EditorTextType,
    lineHistorical: number,
    tooltipRef: RefObject<Tooltip.Handle<{ text: string }>>,
    addNewHighlight: AddNewHighlightObj
}

export default function ResultCard({i, result, isDoubleMode, confirmedSearch, historicalText, lineHistorical, tooltipRef, addNewHighlight}: Props) {
    const {item, originalIndex} = result
    const {containerClass, headerClass, badgeClass, isOccupied, isError} = getCardStyle(item)
    const isFree = isDoubleMode && item.range?.error === 0

    function getCardStyle(item: SingleSearchType) {
        if (item.range === undefined) {
            return {
                containerClass: "border-gray-200",
                headerClass: "bg-orange-50 border-orange-100",
                badgeClass: "bg-orange-600 text-white",
                isOccupied: false,
                isError: false
            }
        }

        switch (item.range.error) {
            case 0: // Valido
                return {
                    containerClass: "border-gray-200",
                    headerClass: "bg-orange-50 border-orange-100",
                    badgeClass: "bg-orange-600 text-white",
                    isOccupied: false,
                    isError: false
                }
            case 1: // Occupato
                return {
                    containerClass: "border-gray-200 opacity-50 grayscale",
                    headerClass: "bg-gray-50 border-gray-200",
                    badgeClass: "bg-gray-400 text-white",
                    isOccupied: true,
                    isError: false
                }
            case -1: // Errore
                return {
                    containerClass: "border-red-200 opacity-50",
                    headerClass: "bg-red-50 border-red-200",
                    badgeClass: "bg-red-500 text-white",
                    isOccupied: false,
                    isError: true
                }
            default:
                return {
                    containerClass: "border-gray-200",
                    headerClass: "bg-gray-50 border-gray-200",
                    badgeClass: "bg-gray-400 text-white",
                    isOccupied: false,
                    isError: false
                }
        }
    }

    return (
        <div
            key={`${item.text.urn}-${item.text.found}`}
            className={`${RESULT_CARD_CONTAINER_CLASS} ${i === 0 ? "mt-2.5" : ""} ${containerClass}`}
        >
            <header className={`flex items-center justify-between px-3 py-2 rounded-t-lg border-b ${headerClass}`}>
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className={`shrink-0 text-[11px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center ${badgeClass}`}>
                        {originalIndex + 1}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide truncate">
                        {item.text.method || item.text.source || "—"}
                    </span>
                </div>
            </header>

            <div className={RESULT_CARD_BODY_CLASS}>
                <p className={`${TEXT_FONT_CLASS} text-sm text-gray-800 leading-snug line-clamp-3 wrap-break-word`}>{item.text.found}</p>
                <p className="mt-1 text-[11px] text-gray-400 truncate">{item.text.urn}</p>
            </div>

            <footer className={RESULT_CARD_FOOTER_CLASS}>
                <div className="flex flex-wrap gap-1 min-w-0">
                    {(Array.isArray(item.text.algos) ? item.text.algos : [item.text.algos]).map((algo, i) => (
                        <span
                            key={i}
                            className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap"
                        >
                            {algo}
                        </span>
                    ))}
                </div>
                {isOccupied ? (
                    <Tooltip.Trigger
                        handle={tooltipRef.current}
                        payload={{text: "Non puoi salvare questa evidenziazione! Tale posizione è già occupata da un'altra evidenziazione."}}
                        aria-disabled="true"
                        className="shrink-0 text-xs font-semibold px-3 py-1 rounded-md transition-colors bg-gray-100 text-gray-400 cursor-not-allowed"
                    >
                        Aggiungi
                    </Tooltip.Trigger>
                ) : isError ? (
                    <Tooltip.Trigger
                        handle={tooltipRef.current}
                        payload={{text: "Errore durante la ricerca, il risultato è stato trovato correttamente ma non è associabile al testo storico selezionato."}}
                        aria-disabled="true"
                        className="shrink-0 text-xs font-semibold px-3 py-1 rounded-md transition-colors bg-red-100 text-red-500 cursor-not-allowed"
                    >
                        Aggiungi
                    </Tooltip.Trigger>
                ) : item.range == undefined ? (
                    <PreviewSingle item={item}/>
                ) : (
                    <PreviewDouble
                        item={item}
                        historicalText={historicalText}
                        lineHistorical={lineHistorical}
                        isFree={isFree}
                        addNewHighlight={addNewHighlight}
                        confirmedSearch={confirmedSearch}
                    />
                )}
            </footer>
        </div>
    )
}
