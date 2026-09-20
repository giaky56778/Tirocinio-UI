import {memo} from 'react';
import {Form} from "@base-ui/react/form";
import {Field} from "@base-ui/react/field";
import {type AlertDialog} from "@base-ui/react/alert-dialog";
import {type EditorTextType} from "@/features/double-editor/editorPage.tsx";
import {type SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import DialogSSESearch from "@/features/search/components/search/dialogSSESearch.tsx";
import AlertModifySearch, {type AlertModifyPayloadType} from "@/features/search/components/search/alertModifySearch.tsx";
import {LockClose, SearchIcon, XIcon} from "@/components/ui/icons";
import SearchOptionDialog from "@/features/search/components/search/searchDialog/searchOptionDialog.tsx";
import ComboboxTextSearch from "@/features/search/components/search/comboboxTextSearch.tsx";
import ResultSection from "@/features/search/components/search/resultSection.tsx";
import useSearchPage from "@/features/search/hooks/useSearchPage.ts";
import {type TextSelectedType} from "@/hook/useTextNameSelection.ts";
import {type SettingsType, type TooltipType} from "@/features/search/api/searchApiType.ts";
import {Button} from "@base-ui/react";

export const SEARCH_SECTION_CONTAINER_CLASS = "text-left relative flex flex-col h-full w-full flex-1 min-w-0 min-h-0 z-0"
export const SEARCH_SECTION_HEADER_CLASS = "relative flex shrink-0 items-center justify-center h-24 bg-orange-100 shadow-xs"
export const SEARCH_SECTION_FORM_CLASS = "border-b border-t border-t-gray-300 border-gray-500 p-4"
export const SEARCH_RESULTS_CONTAINER_CLASS = "relative flex-1 min-h-0"

type SearchResultsSectionProps = {
    settings: SettingsType,
    tooltip: TooltipType,
    resetSearchElement: () => void,
    historicalText: EditorTextType,
    selectedText: TextSelectedType,
    isTextLoading: boolean,
    searchHandle: AlertDialog.Handle<AlertModifyPayloadType>,
    searchElement?: SearchType
}

function SearchResultsSection({settings, tooltip, searchElement, resetSearchElement, historicalText, selectedText, isTextLoading, searchHandle}: SearchResultsSectionProps) {

    const {
        dialogHandle, sseData, debounceTimerRef,
        confirmedSearch,
        algoSelected, setAlgoSelected,
        searchQuery, setSearchQuery,
        sourcesSelected, setSourcesSelected,
        onSearchSubmit
    } = useSearchPage({isTextLoading,settings, selectedText,resetSearchElement, searchElement})

    return (
        <>
            <DialogSSESearch
                dialogHandle={dialogHandle}
                algoSelected={algoSelected}
                data={sseData}
            />
            <AlertModifySearch alertHandle={searchHandle} />
            <div className={SEARCH_SECTION_CONTAINER_CLASS}>
                <header className={SEARCH_SECTION_HEADER_CLASS}>
                    <h1>Ricerca</h1>
                </header>
                <div className={SEARCH_SECTION_FORM_CLASS}>
                    <Form
                        className="flex flex-col gap-2"
                        onFormSubmit={onSearchSubmit}
                    >
                        <div className="flex items-center gap-3 mb-4 mt-4 ">
                            <div
                                className={`${searchElement ? " cursor-pointer bg-gray-100" : ""} 
                                            w-50 border border-gray-300 rounded px-2 h-9 flex-1 flex items-center gap-2 overflow-hidden`}
                            >
                                <SearchIcon className="size-5"/>
                                <Field.Root
                                    key={searchElement ? "search-element" : "custom-query"}
                                    name="search-input"
                                    className="flex-1 flex items-center gap-2 overflow-hidden"
                                    validationMode="onSubmit"
                                    validate={(value) => {
                                        if (searchElement)
                                            return null
                                        return !String(value ?? "").trim() ? "Inserisci una query di ricerca" : null
                                    }}
                                >
                                    <Field.Control
                                        className={`flex-1 outline-none w-4/5 overflow-x-scroll disabled:opacity-50 disabled:cursor-not-allowed`}
                                        id="search-input"
                                        placeholder={(isTextLoading && searchElement) ? "Caricamento...." : "Inserisci una frase o selezione una porzione del testo"}
                                        value={searchQuery}
                                        readOnly={!!searchElement || isTextLoading}
                                        disabled={isTextLoading}
                                        onChange={(e) => {
                                            const nextQuery = e.target.value
                                            setSearchQuery(nextQuery)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.ctrlKey || e.metaKey || e.altKey)
                                                return

                                            if (searchElement && (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete"))
                                                searchHandle.openWithPayload({onConfirm: resetSearchElement})
                                        }}
                                    />
                                    <Field.Error className="text-xs text-red-600"/>
                                </Field.Root>
                                {searchElement &&
                                    <button
                                        type={"button"}
                                        className={"flex items-center justify-center shrink-0 w-6 h-6 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"}
                                        onClick={() => searchHandle.openWithPayload({onConfirm: resetSearchElement})}
                                    >
                                        <LockClose className={"size-6"}/>
                                    </button>
                                }
                                {(searchQuery) !== '' &&
                                    <button
                                        type={"button"}
                                        className={"flex items-center justify-center shrink-0 w-6 h-6 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"}
                                        onClick={() => {
                                            if (debounceTimerRef.current)
                                                clearTimeout(debounceTimerRef.current)

                                            setSearchQuery('')
                                            resetSearchElement()
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
                                    algoSelected={algoSelected}
                                    setAlgoSelected={setAlgoSelected}
                                />
                            </div>
                        </div>
                        <ComboboxTextSearch
                            sourcesSelected={sourcesSelected}
                            setSourcesSelected={setSourcesSelected}
                            settings={settings}
                        />
                        <Button
                            type="submit"
                            disabled={sseData.isLoading}
                            className="mt-7 w-1/2 mx-auto block bg-orange-700 hover:bg-orange-800 cursor-pointer transition-colors text-white px-4 py-2 rounded shadow-lg font-bold"
                        >
                            Ricerca
                        </Button>
                    </Form>
                </div>
                <div className={SEARCH_RESULTS_CONTAINER_CLASS}>
                    <ResultSection
                        filename={sseData.resultFilename}
                        confirmedSearch={confirmedSearch}
                        historicalText={historicalText}
                        isLoading={sseData.isLoading}
                    />
                </div>
            </div>
        </>
    )
}

export default memo(SearchResultsSection)
