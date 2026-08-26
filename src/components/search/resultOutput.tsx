import {AddNewHighlightsType, SingleSearchType} from "@/api";
import {VList} from "virtua";
import {Tooltip} from "@base-ui/react/tooltip";
import {SearchType} from "@/components/reducer/selectionReducer.ts";
import {EditorTextType} from "@/components/page/editorPage.tsx";
import ButtonForSingle from "@/components/search/singleCard.tsx";
import ButtonForDouble from "@/components/search/doubleCard.tsx";
import LoadMore from "@/components/search/loadMore.tsx";
import {useRef} from "react";
import CommonTooltip from "@/components/common/commonTooltip.tsx";
import {TEXT_FONT_CLASS} from "@/utils/globalType.ts";
import {UseMutationResult} from "@tanstack/react-query";

export const RESULT_CARD_CONTAINER_CLASS = "mb-2.5 ml-4 mr-2 rounded-lg border bg-white shadow-sm transition-shadow"
export const RESULT_CARD_HEADER_CLASS = "flex items-center justify-between px-3 py-2 rounded-t-lg border-b bg-orange-50 border-orange-100"
export const RESULT_CARD_BODY_CLASS = "px-3 pt-2 pb-1"
export const RESULT_CARD_FOOTER_CLASS = "flex items-center justify-between gap-2 px-3 pb-2.5 pt-1.5 border-t border-gray-100"

type ResultOutputProps = {
    displayedResults: { item: SingleSearchType; originalIndex: number }[],
    filterValid: boolean,
    isDoubleMode: boolean,
    confirmedSearch?: SearchType,
    biblicalText: EditorTextType,
    lineBiblical: number,
    hasMore: boolean,
    isFetching: boolean,
    onLoadMore: () => void,
    addNewHighlightMutation:UseMutationResult<void, Error, AddNewHighlightsType, unknown>,
    hasSearch: boolean
    accumulatedResultsLength: number
}

export default function ResultOutput({displayedResults, filterValid, isDoubleMode, confirmedSearch, biblicalText, lineBiblical, hasMore, isFetching, onLoadMore, addNewHighlightMutation, hasSearch,accumulatedResultsLength}: ResultOutputProps) {

    const tooltipRef = useRef(Tooltip.createHandle<{text: string}>())

    if(!hasSearch) {
        return(
            <div className="p-4 flex-1">
                <p className="text-gray-500 text-sm">Impostare una ricerca</p>
                <LoadMore
                    hasSearch={hasSearch}
                    hasMore={hasMore}
                    isFetching={isFetching}
                    onLoadMore={onLoadMore}
                />
            </div>
        )
    }

    if (displayedResults.length == 0) {
        if(displayedResults.length === accumulatedResultsLength)
            return(
                <div className="p-4 flex-1">
                    <p className="text-gray-500 text-sm">Nessun risultato trovato o la ricerca è scaduta</p>
                    <LoadMore
                        hasSearch={hasSearch}
                        hasMore={hasMore}
                        isFetching={isFetching}
                        onLoadMore={onLoadMore}
                    />
                </div>
            )

        if(filterValid)
            return (
                <div className="p-4 flex-1">
                    <p className="text-gray-500 text-sm">Nessun risultato valido trovato da 0 a {accumulatedResultsLength}</p>
                    <LoadMore
                        hasSearch={hasSearch}
                        hasMore={hasMore}
                        isFetching={isFetching}
                        onLoadMore={onLoadMore}
                    />
                </div>
            )
        else
            return (
                <div className="p-4 flex-1">
                    <p className="text-gray-500 text-sm">Nessun risultato trovato</p>
                    <LoadMore
                        hasSearch={hasSearch}
                        hasMore={hasMore}
                        isFetching={isFetching}
                        onLoadMore={onLoadMore}
                    />
                </div>
            )
    }

    return (
        <VList style={{flex: 1}}>
            {displayedResults.map(({item, originalIndex}, i) => {
                const error = item.range?.error
                const isOccupied = error === 1
                const isFree = isDoubleMode && error === 0
                console.log(item)
                return (
                    <div
                        key={`${item.text.urn}-${item.text.found}`}
                        className={`${RESULT_CARD_CONTAINER_CLASS} ${i === 0 ? "mt-2.5" : ""}
                        ${isOccupied
                            ? "border-gray-200 opacity-50 grayscale"
                            : "border-gray-200 hover:shadow-md"
                        }`}
                    >
                        <header className={`flex items-center justify-between px-3 py-2 rounded-t-lg border-b
                                ${isOccupied ? "bg-gray-50 border-gray-200" : "bg-orange-50 border-orange-100"}`}>
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className={`shrink-0 text-[11px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center
                                                ${isOccupied ? "bg-gray-400 text-white" : "bg-orange-600 text-white"}
                                    `}
                                >
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
                                        className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                        {algo}
                                    </span>
                                ))}
                            </div>
                            {isOccupied ? (
                                <Tooltip.Provider>
                                    <Tooltip.Trigger
                                        handle={tooltipRef.current}
                                        payload={{text: "Non puoi salvare questa evidenziazione! Tale posizione è già occupata da un'altra evidenziazione."}}
                                    >
                                        <button
                                            aria-disabled="true"
                                            onClick={(e) => {
                                                e.preventDefault()
                                            }}
                                            className="shrink-0 text-xs font-semibold px-3 py-1 rounded-md transition-colors bg-gray-100 text-gray-400 cursor-not-allowed"
                                        >
                                            Aggiungi
                                        </button>
                                    </Tooltip.Trigger>
                                    <CommonTooltip
                                        handle={tooltipRef}
                                        disabled={false}
                                        side="top"
                                    />
                                </Tooltip.Provider>
                            ) : item.range == undefined ? (
                                <ButtonForSingle item={item}/>
                            ) : (
                                <ButtonForDouble
                                    item={item}
                                    biblicalText={biblicalText}
                                    lineBiblical={lineBiblical}
                                    isFree={isFree}
                                    addNewHighlightMutation={addNewHighlightMutation}
                                    confirmedSearch={confirmedSearch}
                                />
                            )}
                        </footer>
                    </div>
                )
            })}
            <LoadMore
                hasSearch={hasSearch}
                hasMore={hasMore}
                isFetching={isFetching}
                onLoadMore={onLoadMore}
            />
        </VList>
    )
}
