import {memo, useEffect, useRef} from "react";
import {Dialog, Field, Form} from "@base-ui/react";
import {SettingsType, TooltipType} from "@/api";
import useSSESearch from "@/hooks/useSSESearch.ts";
import {AlertDialog} from "@base-ui/react/alert-dialog";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {TextSelectedType} from "@/hooks/useTextNameSelection.ts";
import {EditorTextType} from "@/components/page/editorPage.tsx";
import {SearchType} from "@/components/reducer/selectionReducer.ts";
import DialogSSESearch from "@/components/search/dialogSSESearch.tsx";
import AlertModifySearch from "@/components/search/alertModifySearch.tsx";
import {LockClose, SearchIcon, XIcon} from "@/components/icons";
import SearchOptionDialog from "@/components/search/searchDialog/searchOptionDialog.tsx";
import ComboboxTextSearch from "@/components/search/comboboxTextSearch.tsx";
import ShowResultSearch from "@/components/search/showResultSearch.tsx";
import useSearchPage from "@/hooks/useSearchPage.ts";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";

export const SEARCH_SECTION_CONTAINER_CLASS = "text-left relative flex flex-col h-full w-1/2 min-w-0 min-h-0 z-0"
export const SEARCH_SECTION_HEADER_CLASS = "relative flex shrink-0 items-center justify-center h-24 bg-orange-100 shadow-xs"
export const SEARCH_SECTION_FORM_CLASS = "border-b border-gray-500 p-4"
export const SEARCH_RESULTS_CONTAINER_CLASS = "relative flex-1 min-h-0"

type SearchResultsSectionProps = {
    settings: SettingsType;
    tooltip: TooltipType;
    searchElement: SearchType | undefined;
    resetSearchElement: () => void;
    biblicalText: EditorTextType;
    selectedText: TextSelectedType;
}

const SearchResultsSection = memo(function SearchResultsSection({
    settings,
    tooltip,
    searchElement,
    resetSearchElement,
    biblicalText
}: SearchResultsSectionProps) {

    const params = useSearchPage({settings})
    const searchHandle = useRef(AlertDialog.createHandle())
    const dialogHandle = useRef(Dialog.createHandle())
    const globalState=useGlobalState()
    const setBatchedParams = useBatchedSearchParams()
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const {handleSearch, sseData} = useSSESearch({
        searchQuery:params.searchQuery,
        sourcesSelected:params.sourcesSelected,
        algoSelected:params.algoSelected,
        dialogHandle,
        initialResultFilename: globalState.state.search?.resultFilename
    })

    useEffect(() => {
        if (searchElement != undefined) {
            params.setSearchQuery(searchElement.text)
        }
    }, [searchElement])

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])


    const onSearchSubmit = () => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }
        params.setConfirmedSearch(searchElement)
        void handleSearch()

        /*
        const updates: Record<string, string | undefined> = {
            q: undefined,
            b: undefined,
            start: undefined,
            end: undefined
        }

        if (searchElement) {
            updates.b = `${searchElement.path}:${searchElement.filename}`
            if (searchElement.selection) {
                updates.start = String(searchElement.selection.start)
                updates.end = String(searchElement.selection.end)
            }
        } else if (params.searchQuery.trim()) {
            updates.q = params.searchQuery;
        }

        setBatchedParams(updates)

         */
    }

    return (
        <>
            <DialogSSESearch
                dialogHandle={dialogHandle}
                algoSelected={params.algoSelected}
                data={sseData}
            />
            <AlertModifySearch
                alertHandle={searchHandle}
                resetSearchElement={resetSearchElement}
            />
            <div className={SEARCH_SECTION_CONTAINER_CLASS}>
                <div className={SEARCH_SECTION_HEADER_CLASS}>
                    <h1>Search Query</h1>
                </div>
                <div className={SEARCH_SECTION_FORM_CLASS}>
                    <Form
                        className="flex flex-col gap-2"
                        onFormSubmit={onSearchSubmit}
                    >
                        <div className="flex items-center gap-3 mb-4 mt-4 ">
                            <div className={`${searchElement ? " cursor-pointer bg-gray-100" : ""} w-50 border border-gray-300 rounded px-2 h-9 flex-1 flex items-center gap-2 overflow-hidden`}>
                                <SearchIcon className="size-5"/>
                                <Field.Root
                                    key={searchElement ? "search-element" : "custom-query"}
                                    name="search-input"
                                    className="flex-1 flex items-center gap-2 overflow-hidden"
                                    validationMode="onChange"
                                    validate={(value) => {
                                        if (searchElement)
                                            return null
                                        return !String(value ?? "").trim() ? "Inserisci una query di ricerca" : null
                                    }}
                                >
                                    <Field.Control
                                        className={`flex-1 outline-none w-4/5 overflow-x-scroll`}
                                        id="search-input"
                                        placeholder="Inserisci una query di ricerca"
                                        value={params.searchQuery}
                                        onChange={(e) => {
                                            const nextQuery = e.target.value
                                            params.setSearchQuery(nextQuery)
                                            if (debounceTimerRef.current) {
                                                clearTimeout(debounceTimerRef.current)
                                            }
                                            debounceTimerRef.current = setTimeout(() => {
                                                setBatchedParams({
                                                    q: nextQuery || undefined,
                                                    start: undefined,
                                                    end: undefined
                                                }, '/search', 'searchResultsSection')
                                            }, 400)
                                        }}
                                        readOnly={!!searchElement}
                                        onKeyDown={(e) => {
                                            if (e.ctrlKey || e.metaKey || e.altKey) {
                                                return
                                            }

                                            if (searchElement &&
                                                (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete")
                                            ) {
                                                searchHandle.current.open(null)
                                            }
                                        }}
                                    />
                                    <Field.Error className="text-xs text-red-600"/>
                                </Field.Root>
                                {searchElement &&
                                    <button
                                        type={"button"}
                                        className={"flex items-center justify-center shrink-0 w-6 h-6 rounded-full hover:bg-gray-200 transition-colors"}
                                        onClick={() => searchHandle.current.open(null)}
                                    >
                                        <LockClose className={"size-6"}/>
                                    </button>
                                }
                                {params.searchQuery !== '' &&
                                    <button
                                        type={"button"}
                                        className={"flex items-center justify-center shrink-0 w-6 h-6 rounded-full hover:bg-gray-200 transition-colors"}
                                        onClick={() => {
                                            if (debounceTimerRef.current) {
                                                clearTimeout(debounceTimerRef.current)
                                            }
                                            params.setSearchQuery('');
                                            resetSearchElement();
                                        }}
                                    >
                                        <XIcon className={"size-6"}/>
                                    </button>
                                }
                            </div>
                            <div className="shrink-0">
                                <SearchOptionDialog
                                    settings={settings}
                                    tooltip={tooltip}
                                    algoSelected={params.algoSelected}
                                    setAlgoSelected={params.setAlgoSelected}
                                />
                            </div>
                        </div>
                        <ComboboxTextSearch
                            sourcesSelected={params.sourcesSelected}
                            setSourcesSelected={params.setSourcesSelected}
                            settings={settings}
                        />
                        <button
                            type="submit"
                            disabled={sseData.isLoading}
                            className="mt-7 w-1/2 mx-auto block bg-orange-500 hover:bg-orange-700 cursor-pointer transition-colors text-white px-4 py-2 rounded shadow-lg font-medium"
                        >
                            Ricerca
                        </button>
                    </Form>
                </div>
                <div className={SEARCH_RESULTS_CONTAINER_CLASS}>
                    <ShowResultSearch
                        filename={sseData.resultFilename}
                        confirmedSearch={params.confirmedSearch}
                        biblicalText={biblicalText}
                        isLoading={sseData.isLoading}
                    />
                </div>
            </div>
        </>
    )
})

export default SearchResultsSection
