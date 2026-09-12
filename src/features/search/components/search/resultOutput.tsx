import {RefObject} from "react";
import {VList} from "virtua";
import {Tooltip} from "@base-ui/react/tooltip";
import {SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import {EditorTextType} from "@/features/double-editor/editorPage.tsx";
import LoadMore from "@/features/search/components/search/loadMore.tsx";
import ResultCard from "@/features/search/components/search/resultCard.tsx";
import {AddNewHighlightsType} from "@/features/search/hooks/useApiSearch.ts";
import {SearchResultQueryType} from "@/features/search/hooks/useSearchResults.ts";
import {SingleSearchType} from "@/features/search/api/searchApiType.ts";

export const RESULT_CARD_CONTAINER_CLASS = "mb-2.5 ml-4 mr-2 rounded-lg border bg-white"
export const RESULT_CARD_HEADER_CLASS = "flex items-center justify-between px-3 py-2 rounded-t-lg border-b bg-orange-50 border-orange-100"
export const RESULT_CARD_BODY_CLASS = "px-3 pt-2 pb-1"
export const RESULT_CARD_FOOTER_CLASS = "flex items-center justify-between gap-2 px-3 pb-2.5 pt-1.5 border-t border-gray-100"

export type AddNewHighlightObj = {
    add: (data: AddNewHighlightsType) => void
    isPending: boolean
}

type ResultOutputProps = {
    displayedResults: {
        item: SingleSearchType
        originalIndex: number
    }[]
    filterValid: boolean
    isDoubleMode: boolean
    hasSearch: boolean
    historicalText: EditorTextType
    lineHistorical: number
    accumulatedResultsLength: number
    tooltipRef: RefObject<Tooltip.Handle<{ text: string }>>
    addNewHighlight: AddNewHighlightObj
    confirmedSearch?: SearchType
    searchResultQuery: SearchResultQueryType
}

export default function ResultOutput({
                                         displayedResults,
                                         filterValid,
                                         isDoubleMode,
                                         hasSearch,
                                         historicalText,
                                         lineHistorical,
                                         accumulatedResultsLength,
                                         tooltipRef,
                                         confirmedSearch,
                                         addNewHighlight,
                                         searchResultQuery
                                     }: ResultOutputProps) {

    if (!hasSearch)
        return (
            <div className="p-4 flex-1">
                <p className="text-gray-500 text-sm">Impostare una ricerca</p>
                <LoadMore
                    hasSearch={hasSearch}
                    searchResultQuery={searchResultQuery}
                />
            </div>
        )

    if (displayedResults.length == 0) {
        if (displayedResults.length === accumulatedResultsLength)
            return (
                <div className="p-4 flex-1">
                    <p className="text-gray-500 text-sm">Nessun risultato trovato o la ricerca è scaduta</p>
                    <LoadMore
                        hasSearch={hasSearch}
                        searchResultQuery={searchResultQuery}
                    />
                </div>
            )

        if (filterValid)
            return (
                <div className="p-4 flex-1">
                    <p className="text-gray-500 text-sm">Nessun risultato valido trovato da 0 a {accumulatedResultsLength}</p>
                    <LoadMore
                        hasSearch={hasSearch}
                        searchResultQuery={searchResultQuery}
                    />
                </div>
            )
        else
            return (
                <div className="p-4 flex-1">
                    <p className="text-gray-500 text-sm">Nessun risultato trovato</p>
                    <LoadMore
                        hasSearch={hasSearch}
                        searchResultQuery={searchResultQuery}
                    />
                </div>
            )
    }

    return (
        <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
            {addNewHighlight.isPending && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-lg shadow-lg text-orange-700 font-medium text-sm">
                        <svg className="animate-spin h-5 w-5 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Aggiunta in corso...
                    </div>
                </div>
            )}
            <VList style={{flex: 1}}>
                {displayedResults.map(({item, originalIndex}, i) => (
                    <ResultCard
                        key={`${item.text.urn}-${item.text.found}`}
                        i={i}
                        result={{item, originalIndex}}
                        isDoubleMode={isDoubleMode}
                        confirmedSearch={confirmedSearch}
                        historicalText={historicalText}
                        lineHistorical={lineHistorical}
                        addNewHighlight={addNewHighlight}
                        tooltipRef={tooltipRef}
                    />
                ))}
                <LoadMore
                    hasSearch={hasSearch}
                    searchResultQuery={searchResultQuery}
                />
            </VList>
        </div>
    )
}

