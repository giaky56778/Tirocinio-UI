import {memo, useRef} from "react";
import {Switch} from "@base-ui/react/switch";
import {Tooltip} from "@base-ui/react/tooltip";
import CommonTooltip from "@/components/common/commonTooltip";
import {SearchType} from "@/components/reducer/selectionReducer.ts";
import {DownloadIcon} from "@/components/icons";
import {EditorTextType} from "@/components/page/editorPage.tsx";
import ResultsCardPreviewSkeleton from "@/components/skeleton/resultCardPreviewSkeleton.tsx";
import ResultOutput from "@/components/search/resultOutput.tsx";
import useSearchResults from "@/hooks/useSearchResults.ts";

export const SEARCH_RESULTS_SECTION_CLASS = "border-b border-gray-500 flex flex-col h-full min-h-0 overflow-hidden bg-slate-50/50"
export const SEARCH_RESULTS_HEADER_GRID_CLASS = "grid grid-cols-[1fr_auto_1fr] items-center p-4 pb-2 shrink-0 bg-white border-b border-slate-200"

type Props = {
    filename: {
        filename: string
        total_size: number
    },
    biblicalText: EditorTextType,
    confirmedSearch?: SearchType,
    isLoading: boolean
}

const ShowResultSearch = memo(function ShowResultSearch({filename, biblicalText, confirmedSearch, isLoading}: Props) {

    const tooltipRef = useRef(Tooltip.createHandle<{text:string}>())

    const {
        hasSearch, isDoubleMode, filterValid, confirmedSearchKey,
        setFilterState,
        searchResultQuery,
        displayedResults,
        exportResults,
        addNewHighlightMutation,
        accumulatedResultsLength,
        lineBiblical
    } = useSearchResults({ filename, confirmedSearch })

    return (
        <div className={SEARCH_RESULTS_SECTION_CLASS}>
            <div className={SEARCH_RESULTS_HEADER_GRID_CLASS}>
                <h2 className="text-sm font-medium">Results</h2>
                <button
                    disabled={!hasSearch}
                    onClick={exportResults}
                    className={`${hasSearch ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-500 cursor-not-allowed'} inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md text-white transition-colors duration-100 shadow-sm select-none`}
                >
                    <DownloadIcon className="size-6"/>
                    Download Excel
                </button>
                <div className="flex justify-end">
                    <Tooltip.Provider>
                        <Tooltip.Trigger
                            handle={tooltipRef.current}
                            render={<label/>}
                            className={`inline-flex items-center gap-2 text-xs font-medium text-gray-600 select-none bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 transition-colors duration-100 
                                        ${!confirmedSearch ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
                            `}
                            payload={{text: "Conferma una ricerca per abilitare il filtro"}}
                        >
                            <Switch.Root
                                render={<button/>}
                                nativeButton
                                disabled={!confirmedSearch}
                                checked={filterValid}
                                onCheckedChange={(checked: boolean) => setFilterState({
                                    key: confirmedSearchKey,
                                    value: checked
                                })}
                                className={`flex h-4.5 w-8 shrink-0 border border-neutral-400 data-checked:border-emerald-600 data-checked:bg-emerald-600 bg-white p-0.5 rounded-full transition-colors duration-150 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 
                                            ${!confirmedSearch ? 'cursor-not-allowed' : ''}
                                `}
                            >
                                <Switch.Thumb className="size-3 bg-neutral-400 data-checked:bg-white rounded-full transition-[translate,background-color] duration-150 ease-[ease] data-checked:translate-x-3.5"/>
                            </Switch.Root>
                            Solo validi
                        </Tooltip.Trigger>
                        <CommonTooltip
                            handle={tooltipRef}
                            disabled={!!confirmedSearch}
                            side="top"
                        />
                    </Tooltip.Provider>
                </div>
            </div>
            {isLoading ? (
                <ResultsCardPreviewSkeleton length={5}/>
            ) : (
                <ResultOutput
                    hasSearch={hasSearch}
                    displayedResults={displayedResults}
                    filterValid={filterValid}
                    isDoubleMode={isDoubleMode}
                    confirmedSearch={confirmedSearch}
                    biblicalText={biblicalText}
                    lineBiblical={lineBiblical}
                    hasMore={searchResultQuery.hasNextPage}
                    isFetching={searchResultQuery.isFetching}
                    onLoadMore={() => {
                        if (searchResultQuery.hasNextPage)
                            void searchResultQuery.fetchNextPage()
                    }}
                    addNewHighlightMutation={addNewHighlightMutation}
                    accumulatedResultsLength={accumulatedResultsLength}
                />
            )}
        </div>
    )
})

export default ShowResultSearch
