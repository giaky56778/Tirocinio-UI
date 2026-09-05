import {Suspense, useEffect, useRef} from "react";
import SearchPageEditor from "@/features/search/components/search/searchPageEditor.tsx";
import SearchPageSkeleton from "@/features/search/components/skeleton/searchSkeleton.tsx";
import ErrorBoundary from "@/components/layout/errorBoundary.tsx";
import ForceUploadDialog from "@/features/upload-section/components/forceUploadDialog.tsx";
import {HighlightStoreProvider} from "@/features/editor/store/highlightStore.tsx";
import {SelectionStoreProvider} from "@/features/editor/store/selectionStore.tsx";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {useReadSettingsSearch} from "@/features/search/hooks/useApiSearch.ts";
import {useHistoricalTextRead} from "@/features/search/hooks/useHistoricalTextRead.ts";

const SearchPage=()=>(
    <ErrorBoundary>
        <Suspense fallback={<SearchPageSkeleton/>}>
            <SearchPageContent/>
        </Suspense>
    </ErrorBoundary>
)

const EMPTY_ARRAY: never[] = []
const EMPTY_INDEX = {
    content: {},
    maxIndex: 0
}

function SearchPageContent() {

    const settings = useReadSettingsSearch()
    const textHistorical = useHistoricalTextRead('search')
    const globalState = useGlobalState()
    const rightSelectedText = textHistorical.selectedText
    const isFirstLoad = useRef(true)

    useEffect(() => {
        return ()=> {
            globalState.swapPage.confirmExit()
            globalState.initPage.resetInitialMount('searchParams')
        }
    }, [])

    if (!textHistorical.historicalNamesQuery.isLoading && !textHistorical.selectedText) {
        return (
            <>
                <SearchPageSkeleton/>
                <ForceUploadDialog selectText={textHistorical.setSelectedText}/>
            </>
        )
    }

    const rightTextData = textHistorical.textQuery
    const isTextLoading = rightTextData.isLoading || rightTextData.isFetching

    if (isFirstLoad.current && isTextLoading)
        return <SearchPageSkeleton/>

    isFirstLoad.current = false

    return (
        <HighlightStoreProvider>
            <SelectionStoreProvider key={rightSelectedText?.items.id ?? 'no-selected'}>
                <SearchPageEditor
                    settings={ settings.settingsQuery.data!}
                    tooltip={settings.tooltipQuery.data!}
                    text={{
                        text: rightTextData.data?.text ?? EMPTY_ARRAY,
                        index: rightTextData.data?.index ?? EMPTY_INDEX,
                        chapter: rightTextData.data?.chapter ?? EMPTY_ARRAY,
                        listOfText: textHistorical.historicalNames ?? EMPTY_ARRAY
                    }}
                    opTextHistorical={{
                        select: textHistorical.setSelectedText,
                        delete: textHistorical.deleteText
                    }}
                    selectedText={rightSelectedText!}
                    isLoading={isTextLoading}
                />
            </SelectionStoreProvider>
        </HighlightStoreProvider>
    )
}

export default SearchPage
